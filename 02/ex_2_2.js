async function* createFileStreamGenerator(filePath, chunkSize = 1024) {
    console.log(`📁 Открываем файл: ${filePath}`);
    console.log(`📊 Размер чанка: ${chunkSize} байт`);
    
    try {
        // Получаем размер файла
        const fileSize = await mockFileSystem.getFileSize(filePath);
        console.log(`📏 Размер файла: ${fileSize} байт`);
        
        let offset = 0;
        let chunkNumber = 1;
        const totalChunks = Math.ceil(fileSize / chunkSize);
        
        while (offset < fileSize) {
            const currentChunkSize = Math.min(chunkSize, fileSize - offset);
            
            console.log(`📖 Читаем чанк ${chunkNumber}/${totalChunks} (смещение: ${offset}, размер: ${currentChunkSize})`);
            
            // Читаем чанк файла
            const chunk = await mockFileSystem.readFileChunk(filePath, offset, currentChunkSize);
            
            yield {
                chunk: chunk,
                chunkNumber: chunkNumber,
                offset: offset,
                size: currentChunkSize,
                progress: ((offset + currentChunkSize) / fileSize * 100).toFixed(1),
                isLast: offset + currentChunkSize >= fileSize
            };
            
            offset += currentChunkSize;
            chunkNumber++;
            
            // Небольшая задержка для имитации реального чтения
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        console.log(`✅ Файл полностью прочитан. Всего чанков: ${chunkNumber - 1}`);
        
    } catch (error) {
        console.error(`❌ Ошибка чтения файла: ${error.message}`);
        yield { 
            error: true, 
            message: `Ошибка файла: ${error.message}` 
        };
    }
}

// Генератор с обработкой разных типов данных
async function* createUniversalStreamGenerator(source, options = {}) {
    const {
        chunkSize = 1024,
        encoding = 'utf-8',
        onProgress = null
    } = options;
    
    console.log(`🎯 Создаем стрим для: ${source.type || 'unknown'}`);
    
    let processedBytes = 0;
    let chunkIndex = 1;
    
    // Имитируем разные источники данных
    if (source.type === 'file') {
        const fileSize = await mockFileSystem.getFileSize(source.path);
        
        while (processedBytes < fileSize) {
            const chunk = await mockFileSystem.readFileChunk(
                source.path, 
                processedBytes, 
                chunkSize
            );
            
            const result = {
                type: 'chunk',
                data: chunk,
                metadata: {
                    index: chunkIndex,
                    offset: processedBytes,
                    size: chunk.length,
                    total: fileSize,
                    progress: (processedBytes / fileSize * 100).toFixed(1)
                }
            };
            
            // Вызываем callback прогресса если предоставлен
            if (onProgress) {
                onProgress(result.metadata);
            }
            
            yield result;
            
            processedBytes += chunk.length;
            chunkIndex++;
            await new Promise(resolve => setTimeout(resolve, 30));
        }
        
    } else if (source.type === 'array') {
        // Стриминг из массива
        const items = source.data;
        const totalItems = items.length;
        
        for (let i = 0; i < items.length; i += chunkSize) {
            const chunk = items.slice(i, i + chunkSize);
            
            yield {
                type: 'array_chunk',
                data: chunk,
                metadata: {
                    chunkIndex: chunkIndex,
                    startIndex: i,
                    endIndex: i + chunk.length,
                    totalItems: totalItems,
                    progress: ((i + chunk.length) / totalItems * 100).toFixed(1)
                }
            };
            
            chunkIndex++;
            await new Promise(resolve => setTimeout(resolve, 20));
        }
    }
    
    yield { type: 'complete', message: 'Stream finished successfully' };
}

// Тестируем
const testFileStream = async () => {
    console.log("🧪 Тестируем стриминг файлов:");
    
    const fileStream = createFileStreamGenerator('/path/to/large/file.txt', 512);
    
    for await (const chunk of fileStream) {
        if (chunk.error) {
            console.log(`💥 ${chunk.message}`);
            break;
        }
        
        console.log(`📦 Чанк ${chunk.chunkNumber}: ${chunk.chunk.length} байт (${chunk.progress}%)`);
        
        // Здесь можно обрабатывать чанк
        // Например, отправлять по сети, парсить и т.д.
    }
};

// testFileStream();

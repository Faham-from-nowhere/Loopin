import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

let ffmpeg = null;

export const compressVideo = async (videoFile, onProgress) => {
    if (!ffmpeg) {
        ffmpeg = new FFmpeg();
        ffmpeg.on('progress', ({ progress }) => {
            console.log("FFmpeg Progress Payload:", progress);
            if (onProgress && !isNaN(progress)) onProgress(Math.round(progress * 100));
        });
        
        ffmpeg.on('log', ({ message }) => {
            console.log("FFmpeg Log:", message);
        });
        
        // Construct dynamic absolute URLs to bypass Vite's static analyzer
        const baseURL = window.location.origin + '/ffmpeg-mt';
        
        // Load multi-threaded ESM core directly from the same-origin server
        await ffmpeg.load({
            coreURL: `${baseURL}/ffmpeg-core.js`,
            wasmURL: `${baseURL}/ffmpeg-core.wasm`,
            workerURL: `${baseURL}/ffmpeg-core.worker.js`
        });
    }

    const name = 'input.mp4';
    await ffmpeg.writeFile(name, await fetchFile(videoFile));

    // Compress video using ultrafast preset and downscale to 480p to drastically speed up processing
    await ffmpeg.exec([
        '-i', name,
        '-vcodec', 'libx264',
        '-preset', 'ultrafast',
        '-crf', '28',
        '-vf', 'scale=-2:480',
        'output.mp4'
    ]);

    const data = await ffmpeg.readFile('output.mp4');
    
    // Create new compressed File object
    return new File([data.buffer], `compressed_${videoFile.name}`, { type: 'video/mp4' });
};


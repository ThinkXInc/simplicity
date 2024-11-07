// Usage:
// Start recording when the stream is ready
// const uploader = new FileUploader({id: id, uploadUrl: '/upload'});
// navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
//     uploader.startRecording(stream);
// });
// uploader.stopRecording();
// uploader.upload({
//     url: '/upload',
//     withMetaData: someData,
//     onSuccess: (data) => {
//         // Handle success
//         console.log('Upload succeeded:', data);
//     },
//     onError: (error) => {
//         // Handle error
//         console.error('Upload error:', error);
//     }
// });
class FileUploader {
    constructor({
        fileKey = "file",
        fileName = "video.webm",
        metadataKey = "metadata"
    }) {
        this.mediaRecorder = null;
        this.recordedBlobs = [];
        // Configurable keys
        this.fileKey = fileKey || 'file';
        this.fileName = fileName || 'video.webm';
        this.metadataKey = metadataKey || 'metadata';
    }

    // Function to handle data available from MediaRecorder
    handleDataAvailable(event) {
        console.log('[FileUploader] handleDataAvailable called with event:', event);
        if (event.data && event.data.size > 0) {
            this.recordedBlobs.push(event.data);
        }
    }

    // Start recording function
    startRecording(stream) {
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            console.warn('[FileUploader] MediaRecorder is already recording.');
            return;
        }
        let options = { mimeType: 'video/webm;codecs=vp9' };
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            options = { mimeType: 'video/webm;codecs=vp8' };
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                options = { mimeType: 'video/webm' };
                if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                    options = { mimeType: '' };
                }
            }
        }
        this.mediaRecorder = new MediaRecorder(stream, options);
        this.mediaRecorder.ondataavailable = this.handleDataAvailable.bind(this);
        this.mediaRecorder.start();
        console.log('[FileUploader] MediaRecorder recording started', this.mediaRecorder);
    }

    // Stop recording function
    stopRecording() {
        return new Promise((resolve, reject) => {
            if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
                console.warn('[FileUploader] MediaRecorder is not recording.');
                resolve();
                return;
            }
            this.mediaRecorder.onstop = () => {
                console.log('[FileUploader] MediaRecorder stopped.');
                resolve();
            };
            console.log('[FileUploader] MediaRecorder stop recording.');
            this.mediaRecorder.stop();
        });
    }

    // Function to upload video and data
    upload({ url, withMetaData, onSuccess, onError }) {
        const superBuffer = new Blob(this.recordedBlobs, { type: 'video/webm' });

        // Prepare form data
        const formData = new FormData();
        formData.append(this.fileKey, superBuffer, this.fileName);
        formData.append(this.metadataKey, JSON.stringify(withMetaData));

        // Send via fetch
        fetch(url, {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(data => {
            console.log('[FileUploader] Upload successful:', data);
            if (onSuccess) onSuccess(data);
            this.recordedBlobs = [];
        })
        .catch(error => {
            console.error('[FileUploader] Upload failed:', error);
            if (onError) onError(error);
        });
    }
}

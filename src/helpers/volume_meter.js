class VolumeMeter {
    constructor({
        audioElement,
        options = {}
    }) {
        // Create our audio context if none was passed in
        this.audioContext = options.audioContext || new (window.AudioContext || window.webkitAudioContext)();
        this.audioElement = audioElement;

        // Create a source from the audio element
        this.sourceNode = this.audioContext.createMediaElementSource(this.audioElement);
        
        // Create an analyser
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;  // smaller fftSize -> less data, but enough for volume calcs
        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

        // Connect the nodes: source -> analyser -> destination
        this.sourceNode.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);

        // Options for how we calculate or display volume
        this.minScale = options.minScale || 1.0;
        this.maxScale = options.maxScale || 1.4;
        this.smoothing = options.smoothing || 0.8; 
            // used in running average or direct calculation

        // A callback that will receive the volume each frame
        this.onVolumeChange = options.onVolumeChange;

        this.animationId = null;
        this.running = false;
        this.currentVolume = 0;
    }

    start() {
        if (this.running) return;
        this.running = true;
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume().catch(err => console.warn(err));
        }
        this._renderLoop();
    }

    stop() {
        this.running = false;
        cancelAnimationFrame(this.animationId);
    }

    _renderLoop = () => {
        // Request the next frame
        this.animationId = requestAnimationFrame(this._renderLoop);

        // Get frequency data
        this.analyser.getByteFrequencyData(this.dataArray);
        
        // Compute an overall volume from 0..1
        // e.g. sum of bins / 255 / number_of_bins
        let sum = 0;
        for (let i = 0; i < this.dataArray.length; i++) {
            sum += this.dataArray[i];
        }
        let avg = sum / this.dataArray.length;
        let normalizedVolume = avg / 255; // 0..1

        // Optionally smooth it out (running average)
        this.currentVolume = 
            this.currentVolume * this.smoothing + 
            normalizedVolume * (1 - this.smoothing);

        // Tell the outside world (e.g., the button or circle) about the volume
        if (typeof this.onVolumeChange === 'function') {
            // Map [0..1] volume -> [minScale..maxScale]
            const scale = this.minScale + (this.maxScale - this.minScale) * this.currentVolume;
            this.onVolumeChange(scale, this.currentVolume);
        }
    }
}
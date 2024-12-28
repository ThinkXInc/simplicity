class VolumeMeter {
    constructor({
        audioElement,
        options = {},
        onVolumeChange,
    }) {
        console.log('VolumeMeter: constructor invoked with audioElement:', audioElement, 'and options:', options);

        // Create our audio context if none was passed in
        this.audioContext = options.audioContext || new (window.AudioContext || window.webkitAudioContext)();
        console.log('VolumeMeter: AudioContext created or provided. State:', this.audioContext.state);

        this.audioElement = audioElement;

        // Create a source from the audio element
        console.log('VolumeMeter: Creating MediaElementSource from audioElement.');
        this.sourceNode = this.audioContext.createMediaElementSource(this.audioElement);
        
        // Create an analyser
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;  // smaller fftSize -> less data, but enough for volume calcs
        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        console.log('VolumeMeter: Analyser created with fftSize:', this.analyser.fftSize, 'frequencyBinCount:', this.analyser.frequencyBinCount);

        // Connect the nodes: source -> analyser -> destination
        console.log('VolumeMeter: Connecting source -> analyser -> destination.');
        this.sourceNode.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);

        // Options for how we calculate or display volume
        this.minScale = options.minScale || 1.0;
        this.maxScale = options.maxScale || 1.4;
        this.smoothing = options.smoothing || 0.8;
        console.log('VolumeMeter: Volume scale range:', this.minScale, 'to', this.maxScale, 'with smoothing:', this.smoothing);

        // A callback that will receive the volume each frame
        this.onVolumeChange = onVolumeChange;

        this.animationId = null;
        this.running = false;
        this.currentVolume = 0;
    }

    start() {
        console.log('VolumeMeter: start() called. Current running state:', this.running);

        if (this.running) {
            console.log('VolumeMeter: Already running; start() will not restart loop.');
            return;
        }

        this.running = true;

        if (this.audioContext.state === 'suspended') {
            console.log('VolumeMeter: AudioContext is suspended. Attempting to resume...');
            this.audioContext.resume().catch(err => {
                console.warn('VolumeMeter: Error while resuming AudioContext:', err);
            });
        }

        // Begin the render loop
        console.log('VolumeMeter: Starting _renderLoop...');
        this._renderLoop();
    }

    stop() {
        console.log('VolumeMeter: stop() called. Current running state:', this.running);

        this.running = false;
        cancelAnimationFrame(this.animationId);
        console.log('VolumeMeter: Animation frame canceled and meter stopped.');
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

        // Log debug info about sums and averages
        console.log('VolumeMeter: sum of frequency data:', sum);
        console.log('VolumeMeter: average bin volume:', avg);
        console.log('VolumeMeter: normalized volume (0..1):', normalizedVolume);

        // Optionally smooth it out (running average)
        const previousVolume = this.currentVolume;
        this.currentVolume = 
            this.currentVolume * this.smoothing + 
            normalizedVolume * (1 - this.smoothing);

        console.log('VolumeMeter: previousVolume:', previousVolume, '-> currentVolume (smoothed):', this.currentVolume);

        // Tell the outside world (e.g., the button or circle) about the volume
        if (typeof this.onVolumeChange === 'function') {
            // Map [0..1] volume -> [minScale..maxScale]
            const scale = this.minScale + (this.maxScale - this.minScale) * this.currentVolume;
            console.log('VolumeMeter: computed scale:', scale, '(mapped from currentVolume:', this.currentVolume, ')');
            this.onVolumeChange(scale, this.currentVolume);
        }
    }
}

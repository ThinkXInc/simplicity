var GradientPattern = Object.freeze({
    // generate => https://cssgradient.io/
    rainbow: 'linear-gradient(90deg,#ffd33d,#ea4aaa 17%,#b34bff 34%,#01feff 51%,#ffd33d 68%,#ea4aaa 85%,#b34bff)',
    anslim: 'linear-gradient(90deg, rgba(60,128,167,1) 0%, rgba(158,188,200,1) 14%, rgba(255,255,255,1) 30%, rgba(167,47,178,1) 51%, rgba(158,188,200,1) 78%, rgba(60,128,167,1) 100%)',
    smilan: 'linear-gradient(90deg, rgba(60,128,167,1) 0%, rgba(158,188,200,1) 14%, rgba(203,194,49,1) 30%, rgba(167,47,178,1) 51%, rgba(158,188,200,1) 78%, rgba(60,128,167,1) 100%)',
    pear: 'linear-gradient(90deg, rgba(34,193,195,1) 0%, rgba(253,187,45,1) 100%)',
    scash: 'linear-gradient(90deg, rgba(158,188,200,1) 0%, rgba(34,193,195,1) 51%, rgba(203,194,49,1) 100%)',
    paradice: 'linear-gradient(90deg, rgba(158,188,200,1) 0%, rgba(167,47,178,1) 51%, rgba(203,194,49,1) 100%)',
    villea: 'linear-gradient(90deg, rgba(158,188,200,1) 0%, rgba(60,128,167,1) 51%, rgba(203,194,49,1) 100%)',
    bougen: 'linear-gradient(90deg, rgba(158,188,200,1) 0%, rgba(167,47,178,1) 51%, rgba(60,128,167,1) 100%)',
    bougen2: 'linear-gradient(90deg, rgba(60,128,167,1) 0%, rgba(158,188,200,1) 14%, rgba(167,47,178,1) 51%',
    milsan: 'linear-gradient(90deg, rgba(60,128,167,1) 0%, rgba(158,188,200,1) 14%, rgba(203,194,49,1) 30%, rgba(167,47,178,1) 51%, rgba(60,128,167,1) 100%)',
    casabranca: 'linear-gradient(90deg, rgba(131,58,180,1) 0%, rgba(253,29,29,1) 50%, rgba(252,176,69,1) 100%)',
    ocean: 'linear-gradient(90deg, rgba(29,138,147,1) 0%, rgba(9,79,121,1) 35%, rgba(0,212,255,1) 100%)',
    marine: 'linear-gradient(90deg, rgba(122,239,255,1) 0%, rgba(36,110,198,1) 35%, rgba(0,212,255,1) 100%)',
    cooler: 'linear-gradient(90deg, rgba(128,246,255,1) 0%, rgba(57,162,204,1) 35%, rgba(164,251,255,1) 100%)'
});


/**
 * Class for gradient loading bars. Extends from LoadingComponentBase and adds gradient behavior.
 * 
 * @class GradientLoadingBar
 * @extends {LoadingComponentBase}
 */
class GradientLoadingBar extends LoadingComponentBase {
    /**
     * Constructs an instance of GradientLoadingBar.
     * 
     * @param {string} id - The id of the loading component.
     * @param {string} [gradient_pattern=GradientPattern.smilan] - The gradient pattern to be used.
     */
    constructor(id, config, gradient_pattern = GradientPattern.smilan) {
        super(id, config);
        this.__gradient_pattern__ = gradient_pattern;
    }

    /**
     * Inherited from LoadingComponentBase, sets the height and width for the component.
     */
    _setElements() {
        super._setElements();
        this.$view.style.height = '7px';
        this.$view.style.width = '100%';
        this.$view.style.flexShrink = '0';
    }

    /**
     * Starts the loading state, makes the component visible, and initiates the gradient effect.
     */
    startLoading() {
        super.startLoading();
        toggleGradientLoader(this.$view, true, this.__gradient_pattern__);
    }

    /**
     * Stops the loading state, hides the component, and stops the gradient effect.
     */
    stopLoading() {
        super.stopLoading();
        toggleGradientLoader(this.$view, false, this.__gradient_pattern__);
    }
}


/**
 * Toggles the gradient loading effect for a specified element.
 * 
 * @function toggleGradientLoader
 * @param {HTMLElement} $loader - The element for which the gradient loading effect should be toggled.
 * @param {boolean} [enable=true] - Whether the gradient loading effect should be on.
 * @param {string} [pattern=GradientPattern.smilan] - The gradient pattern to be used.
 */
function toggleGradientLoader($loader, enable = true, pattern = GradientPattern.smilan) {
    // Check if style is already added to head
    if (!document.getElementById("gradientLoadingBarStyle")) {
        // define and add @keyframe animation
        var style = document.createElement('style');
        style.id = 'gradientLoadingBarStyle';
        var keyFrames = `
            @keyframes gradientLoadingBar {
                0% {
                    background-position: 100%;
                }
                100% {
                    background-position: 0;
                }
            }
        `;
        style.innerHTML = keyFrames;
        document.head.appendChild(style);
    }

    // create bar element
    var barId = $loader.id + '_bar';
    var existingBar = document.getElementById(barId);

    if (enable) {
        // Only add the bar if it does not already exist
        if (!existingBar) {
            var $bar = document.createElement('span');
            $bar.id = barId;
            $bar.style.display = 'block';
            $bar.style.height = '100%';
            $bar.style.background = pattern;
            $bar.style.backgroundSize = '300% 100%';
            $bar.style.animation = 'gradientLoadingBar 2s linear infinite';
            $loader.appendChild($bar);
        }
    } else {
        // Remove the bar if it exists
        if (existingBar) {
            existingBar.remove();
        }
    }
}
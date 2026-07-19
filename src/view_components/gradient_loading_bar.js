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

//const LoadingAppendedAs = Object.freeze({ 
//    firstChild: 0, 
//    lastChild: 1
//});

class GradientLoadingBar {
    constructor({
        id,
        gradientPattern = GradientPattern.smilan,
        position = LoadingAppendedAs.firstChild
    }) {
        this.id = id;
        this.position = position;
        this.isLoading = false;
        this.createElements();
        this.$view.style.display = 'none';
        this.gradientPattern = gradientPattern;
    }

    createElements() {
        this.$view = document.createElement('div');
        this.$view.id = this.id;
        this.$view.classList.add(`${this.id}`);
        this.$view.classList.add(`spl-${this.constructor.name}`);
        this.$view.style.height = '7px';
        this.$view.style.width = '100%';
        this.$view.style.flexShrink = '0';
    }

	startLoading() {
        this.$view.style.display = 'block';
        this.isLoading = true;
        toggleGradientLoader(this.$view, true, this.gradientPattern);
	}

	stopLoading() {
        this.$view.style.display = 'none';
        this.isLoading = false;
        toggleGradientLoader(this.$view, false, this.gradientPattern);
	}

    mount($parent) {
        // Check if $parent is null or not an instance of HTMLElement
        if (!$parent || !($parent instanceof HTMLElement)) {
            console.error(`[ERROR] Could not find a valid parent element (received: ${$parent}).`);
            return;
        }
    
        // Check if this.$view is valid
        if (!this.$view || !(this.$view instanceof HTMLElement)) {
            console.error(`[ERROR] this.$view is not a valid HTMLElement.`);
            return;
        }
    
        if (this.position == LoadingAppendedAs.firstChild) {
            $parent.insertBefore(this.$view, $parent.firstChild);
        } else {
            $parent.appendChild(this.$view);
        }
    }



}


/**
 * Toggles the gradient loading effect for a specified element.
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
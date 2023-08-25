/**
 * SVGIcons 
 * 
 *  Usage example:
 *     const editSVG = SVGIcons.editIconSVG;
 *     console.log(editSVG);
 */
class SVGIcons {
    static get editIconSVG() {
        return `
            <svg id="EditIconSVG" class="editIconSVG" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 82.98 70.3">
                <defs>
                    <style>
                        .cls-1 { stroke-linecap:round; }
                        .cls-1, .cls-2 { fill:none; stroke:#fff; stroke-miterlimit:10; stroke-width:4px; }
                    </style>
                </defs>
                <path class="cls-2" d="m62.8,10.99l-3.95-3.95s-.64-.9-1.55,0S16.27,48.07,16.27,48.07c0,0-.47.36-.56.99-.18.65-3.18,11.68-3.18,11.68,0,0-.17.5,0,.72s.79,0,.79,0l12.24-3.93s.44-.09.9-.49,40.76-40.76,40.76-40.76c0,0,.37-.49.15-.74s-4.54-4.6-4.58-4.55Z"/>
                <line class="cls-1" x1="13.37" y1="61.63" x2="38.32" y2="61.63"/>
                <line class="cls-1" x1="44.75" y1="61.63" x2="58.06" y2="61.63"/>
            </svg>
        `;
    }
    
    static get doneIconSVG() {
        return `
            <svg id="DoneIconSVG" class="doneIconSVG" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50.26">
                <defs>
                    <style>.cls-1 { fill:none; stroke:#fff; stroke-miterlimit:10; stroke-width:4px; }</style>
                </defs>
                <polyline class="cls-1" points="9.7 26.76 20.15 37.2 41.8 14.52"/>
            </svg>
        `;
    }
    
    static get cancelIconSVG() {
        return `
            <svg id="CancelIconSVG" class="cancelIconSVG" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58.94 58.94">
                <defs>
                    <style>.cls-1 { fill:none; stroke:#fff; stroke-miterlimit:10; stroke-width:6px; }</style>
                </defs>
                <line class="cls-1" x1="2.12" y1="2.12" x2="56.81" y2="56.81"/>
                <line class="cls-1" x1="2.12" y1="56.81" x2="56.81" y2="2.12"/>
            </svg>
        `;
    }
}


/**
 * SVGIcons 
 * 
 *  Usage example:
 *     const editSVG = SVGIcons.editIconSVG;
 *     console.log(editSVG);
 */
class SVGIcons {
    static get enterButtonSVG() {
        return `
        <svg id="EnterButtonSVG" class="enterButtonSVG" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 111.14 111.14">
            <defs>
                <style>
                    .arrow {fill: none; stroke: #333; stroke-linecap: round; stroke-width: 6px;} 
                    .arrow, .bg {stroke-miterlimit: 10;} 
                    .bg {fill: #eee; stroke: #ccc; stroke-width: 2px;}
                </style>
            </defs>
            <circle class="bg" cx="55.57" cy="55.57" r="55.07"/>
            <line class="arrow" x1="30.41" y1="55.65" x2="80.73" y2="55.65"/>
            <line class="arrow" x1="80.73" y1="55.49" x2="63.02" y2="37.78"/>
            <line class="arrow" x1="80.73" y1="55.64" x2="63.02" y2="73.36"/>
        </svg>
        `;
    }

    static get sendButtonSVG() {
        return `
        <svg version="1.1" id="send" xmlns="http://www.w3.org/2000/svg" 
             xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
             viewBox="0 0 60 60" style="enable-background:new 0 0 60 60;" xml:space="preserve">
            <style type="text/css">
                .plane { fill: #FFFFFF; }
            </style>
            <path id="path" class="plane" d="M2.1,8.6v12.6c0,0,0,4.4,4.1,5c4.1,0.6,16.2,2.4,16.2,2.4s2,0.3,2,1.4s-1.9,1.7-1.9,1.7
                L6.2,34.8c0,0-4.1,0.6-4.1,4.1s0,14.5,0,14.5s0.6,3.1,3.6,3.1s50.7-26.1,50.7-26.1s1.5-0.7,1.5-1.2c0-0.5-1.7-1.4-1.7-1.4
                L6,3.6C6,3.6,2.1,2.2,2.1,8.6z"/>
        </svg>
        `;
    }

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

    static get deleteIconSVG() {
        return `
            <svg id="DeleteIconSVG" class="deleteIconSVG" version="1.1" id="delete" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 36 36" style="enable-background:new 0 0 36 36;" xml:space="preserve">
                <style type="text/css">
                    .path{fill:#FFFFFF;}
                </style>
                <path id="path" class="path" d="M24,0.8c1.1,0.5,2.3,1,3.4,1.5c2.3,1.1,3,2.6,2,5c0.2,0.1,0.5,0.3,0.7,0.4C31,8.1,32,8.5,32.9,9
                    c1.9,0.9,2.7,2.9,1.8,4.8c-0.3,0.6-0.6,1.2-0.9,1.8c-0.4,0.8-1,1-1.9,0.6c-1.1-0.5-2.3-1-3.5-1.6c-0.2,2.6-0.4,5.2-0.7,7.7
                    c-0.3,3.2-0.5,6.5-0.8,9.7c-0.2,1.8-1.6,3.3-3.4,3.8c-0.2,0-0.3,0.1-0.4,0.2c-3.6,0-7.2,0-10.8,0c-0.1,0-0.2-0.1-0.4-0.1
                    c-1.9-0.6-3.1-1.8-3.4-3.7c-0.3-2.2-0.4-4.4-0.6-6.5C7.7,21.3,7.3,17.1,7,12.9c-0.1-1.3,0.3-1.8,1.6-1.8c3.7,0,7.4,0,11.2,0
                    c0.2,0,0.4,0,0.9-0.1c-0.4-0.2-0.6-0.3-0.8-0.4c-2.8-1.3-5.5-2.6-8.3-3.9c-1-0.5-1.2-1-0.8-2c0.2-0.4,0.4-0.8,0.6-1.3
                    c1.1-2.3,3.1-3,5.5-1.9c1.1,0.5,2.1,1,3.2,1.5c0.5-1.3,1.5-1.9,2.7-2.3C23.2,0.8,23.6,0.8,24,0.8z M9.6,13.5c0.1,1,0.2,1.9,0.2,2.8
                    c0.4,5.1,0.9,10.3,1.3,15.4c0.1,1,0.9,1.8,1.9,1.8c3.2,0,6.4,0,9.6,0c1,0,1.8-0.7,1.9-1.7c0.1-1,0.2-2,0.3-3c0.4-4.7,0.8-9.4,1.2-14
                    c0-0.4,0.1-0.8,0.1-1.2C20.5,13.5,15.1,13.5,9.6,13.5z M32,13.5c0.9-1.4,0.7-1.9-0.7-2.6C26.2,8.6,21.1,6.3,16,3.9
                    c-1.4-0.6-1.9-0.4-2.5,1.1C19.7,7.8,25.8,10.7,32,13.5z M22.5,4.2C24,4.9,25.5,5.6,27,6.3c0.5-0.9,0.4-1.2-0.4-1.6
                    c-0.9-0.4-1.8-0.8-2.7-1.2C23.2,3.1,22.8,3.2,22.5,4.2z"/>
            </svg>
        `;
    }
}


'use strict'
/**
 * @fileoverview business/view_components/file_upload_view.js
 * FileUpload view component class.
 * 
 * usage:
 * <code>
 * </code>
 * 
 * @author huma@thinkxinc.com (Huma Farheen)
 */


 const FileUploadViewShowingState = Object.freeze({ onhide: 0, onshow: 1, });
 const FileUploadViewUploadState = Object.freeze({
    onready: 0,
    onuploading: 1,
    onuploadcompleted: 2,
    onuploadfailed: 2,
});

 const FileType = Object.freeze({
    pdf: '/img/icons/file_types/pdf_file.png',
    jpg: '/img/icons/file_types/jpg_file.png',
    png: '/img/icons/file_types/png_file.png',
    txt: '/img/icons/file_types/txt_file.png',
    aiff: '/img/icons/file_types/aiff_file.png',
    wav: '/img/icons/file_types/wav_file.png'
});

/**
 * FileUploadTableViewCell component class.
 * @constructor
 * @classdesc `<ul class=fileUploadTableViewCell id={id}></ul>` is necessary in HTML.
 * usage:
 * `<code>`
 * 
 * html:
 * 
 *     <div id=$id class=uploadFileTableViewCell>
 *       <img src=$uploadedFileTypeIcon/> 
 *       <div class = uploadProgressDetails style= "border:2px;">
 *           <div class = fileNameAndPercentage style= "border:2px;">
 *               <div style = "text-overflow: ellipsis; padding-right:20px">$uploadedFileName</div>
 *               <div class = "uploadStatusIndicator">$uploadStatusIndicator</div>
 *       </div>
 *           <div id="uploadIndicatorContainer">
 *                   <div id="uploadIndicator" class = "uploadIndicator">
 *                   </div>
 *           </div>            
 *       </div>
 *       <div id= "uploadCancelButton" class="close-icon">
 *       </div>
 *     </div>
 * 
 * usage:
 * 
 *  var cell = new FileUploadTableViewCell(table_view_id, index_of_cell);  // insert to table automatically
 *  cell.content = content; // update html automatically
 * `</code>`
 * @param {string} id - The DOM id where this view is inserted.
 */
 class FileUploadTableViewCell {
    __id__ = null;
    __table_view_id__ = null;
    __index__ = null;
    __uploadedFileName__ = null;
    __uploadedFileTypeIcon__ = null;

    _content = {};
    index = null;

    //constructor(table_view_id, index, content) {
    constructor(table_view_id, index) {
        // set veiw id
        this.__table_view_id__ = table_view_id;
        this.__index__ = index;
        this.__id__ = `${table_view_id}_${index}`

        // set elements
        this._setElements();
    }

    /**
     * content setter.
     */
    set content(uploadedFileName) {
       this.__uploadedFileName__ = uploadedFileName;
       this.__uploadedFileTypeIcon__ = '/img/icons/file_types/pdf_file.png';
       this._resetCell();
       this._setElements();
    }
    
    set state(state) {

        // set state of upload indicator
        this.$uploadIndicator.style.width = state
        this.$uploadStatusIndicator.innerHTML = state
    }

    /**
     * DOM nodes as variables.
     */
    _setElements() {
        this.$tableView = document.getElementById(this.__table_view_id__);
        if (this.$tableView == null) {
            console.warn(`<ul id=${this.__table_view_id__}></ul> not found.`);
        }
        console.log(this.$tableView)
    }

    /**
     * Initialize the layout for display.
     */
    _initLayout() {
    }
    /* private functions */

    /**
     * Reset cell content.
     */
    _resetCell() {
        // Create new cell view element
        this.$cellView = document.createElement('div');
        this.$cellView.id = this.__id__;
        this.$cellView.classList.add('uploadFileTableViewCell');

        // Create child elements of the cell view
        const img = document.createElement('img');
        img.src = this.__uploadedFileTypeIcon__;
        this.$cellView.appendChild(img);

        const uploadProgressDetails = document.createElement('div');
        uploadProgressDetails.classList.add('uploadProgressDetails');
        this.$cellView.appendChild(uploadProgressDetails);

        const fileNameAndPercentage = document.createElement('div');
        fileNameAndPercentage.classList.add('fileNameAndPercentage');
        uploadProgressDetails.appendChild(fileNameAndPercentage);

        const uploadedFileNameElement = document.createElement('div');
        uploadedFileNameElement.innerText = this.__uploadedFileName__;
        fileNameAndPercentage.appendChild(uploadedFileNameElement);

        this.$uploadStatusIndicator = document.createElement('div');
        this.$uploadStatusIndicator.classList.add('uploadStatusIndicator');
        fileNameAndPercentage.appendChild(this.$uploadStatusIndicator);

        const uploadIndicatorContainer = document.createElement('div');
        uploadIndicatorContainer.id = "uploadIndicatorContainer";
        uploadProgressDetails.appendChild(uploadIndicatorContainer);

        this.$uploadIndicator = document.createElement('div');
        this.$uploadIndicator.id = "uploadIndicator";
        this.$uploadIndicator.classList.add('uploadIndicator');
        uploadIndicatorContainer.appendChild(this.$uploadIndicator);

        this.$uploadCancelButton = document.createElement('div');
        this.$uploadCancelButton.id = "uploadCancelButton";
        this.$uploadCancelButton.classList.add('close-icon');
        this.$cellView.appendChild(this.$uploadCancelButton);

        // Add the newly created cell to the table
        this.$tableView.appendChild(this.$cellView);
    }

    /* public functions */
    hide() {
        console.log(`hide function called in ${this.__id__}`);
        document.getElementById(this.__id__).classList.add('fadeOutToLeft');
    }
}

/**
 * FileUploadView component class.
 * @constructor
 * @classdesc
 * `<code>`
 * 
 *  html:
 * 
 *       <div class=fileUploadView>
 *         <h3 class=title style="text-align: center;">$title</h3>
 *         <p class=subtitle style="text-align: center;">$subtitle</p>
 *         <div class=dropArea>
 *             <img class=dropImage/>
 *             <h5 class=dropTitle>$dropTitle</h5>
 *             <p class=or>$or</p>
 *             <label style="padding:20px;">
 *             <input type="file" id ="upload" class="browseButton" style="display: none;" />
 *             <span class=browseButton>$browseButton</span>
 *             </label>
 *         </div>
 *         <div id =uploadedFilesTable><div>
 *       </div>
 *
 *  usage:
 * 
 *     documentUploadView = new FileUploadView(
 *         'parent_id',
 *         'documentUploadView',
 *         [FileExtension.png, FileExtension.jpg],
 *         'Upload Documents', 
 *         'Please upload your documents', 
 *         'OR',
 *         'Browse Files',
 *         'Drag & Drop Files Here',
 *         'Uploaded Files'
 *     )
 * 
 * `</code>`
 * @param {string} parent_id - The DOM id of the parent element where this view will be appended.
 * @param {string} id - The DOM id where this view is set.
 * @param {list of FileExtension} requested_file_extensions - eg. [FileExtension.jpg, FileExtension.png]
 * @param {string} title - title text
 * @param {string} subtitle - subtitle text
 * @param {string} orTitle - drag & drop area OR text
 * @param {string} browseButtonTitle - browse file button text
 * @param {string} dropTitle - drag & drop area title text
 * @param {string} uploadedFilesTableTitle - uploadFilesTable title
 */
 class FileUploadView extends ViewComponentBase {
    //__upload_file_table_title__ = `<h3 class=uploadedFilesTableTitle>$uploadedFilesTableTitle</h3>` 
    __acceptable_file_extensions__ = ['jpg', 'png', 'pdf', 'wav', 'aiff', 'mp3']

    __requested_file_extensions__ = null;

    __title__ = null;
    __subtitle__ = null;
    __dropTitle__ = null ;
    __browseButtonTitle__ = null;
    __orTitle__ = null;
    __uploadedFilesTableTitle__ = null;
    __cells__ = [];
    __cell_index__ = 0;
    __uploadedFilesTableId__ = 'uploadedFilesTable'; 

    // states
    _showingstate = null;
    _uploadstate = null;

    // data
    _file = null;

    constructor(
        parent_id, id,
        requested_file_extensions,
        title, subtitle, orTitle, browseButtonTitle, dropTitle,
        uploadedFilesTableTitle
    ) {
        super(parent_id, id, 'div');

        // set 
        this.__id__ = id;
        this.__title__ =  title;
        this.__subtitle__ = subtitle;
        this.__requested_file_extensions__ = requested_file_extensions;
        this.__dropTitle__ = dropTitle ;
        this.__browseButtonTitle__ = browseButtonTitle;
        this.__orTitle__ = orTitle;
        this.__uploadedFilesTableTitle__ = uploadedFilesTableTitle

        // validate acceptable file extensions format
        if (this.__requested_file_extensions__)
        if (!Array.isArray(this.__requested_file_extensions__)) {
            console.error(`
                __acceptable_file_extensions__ must be type of array,
                but ${typeof this.__requested_file_extensions__}`);
        } else if (this.__requested_file_extensions__.length == 0) {
            console.error(`__acceptable_file_extensions__ must not be empty`);
        }
     
        // validate acceptable file extensions 
        this.__requested_file_extensions__.forEach((elem) => {
            if (this.__acceptable_file_extensions__.indexOf(elem) === -1) {
                console.error('unacceptable file');
            }
        });

        // TODO: other validations

        // set html elements
        this._createElements();

        // initialize view elements
        this._setElements();
        // set eventhandlers
        this._setEventHandlers();
    }

    /**
     * showing state setter / getter.
     */
    set showingstate(showingstate) {
        this._showingstate = showingstate;
        this.controller.fileUploadViewStateChange(this, this._showingstate); // <-- protocol function call
        switch (state) {
            case FileUploadViewShowingState.onhide:
                console.log(`FileUploadView ${this.__id__} showing state changed -> onhide`);
                break
            case FileUploadViewShowingState.onshow:
                console.log(`FileUploadView ${this.__id__} showing state changed -> onshow`);
                break
        }
    }

    get showingstate() {return this._showingstate}

    /**
     * upload state setter / getter.
     */
    set uploadstate(uploadstate) {
        this._uploadstate = uploadstate;
        this.controller.fileUploadViewStateChange(this, this._uploadstate); // <-- protocol function call
        switch (state) {
            case FileUploadViewUploadState.onready:
                break
        }
    }

    get uploadstate() {return this._uploadstate}


    _createElements() {
        const container = document.getElementById(this.__id__);

        const fileUploadView = document.createElement('div');
        fileUploadView.classList.add('fileUploadView');
        container.appendChild(fileUploadView);

        const title = document.createElement('h3');
        title.classList.add('title');
        title.style.textAlign = "center";
        title.innerText = this.__title__;
        fileUploadView.appendChild(title);

        const subtitle = document.createElement('p');
        subtitle.classList.add('subtitle');
        subtitle.style.textAlign = "center";
        subtitle.innerText = this.__subtitle__;
        fileUploadView.appendChild(subtitle);

        const dropArea = document.createElement('div');
        dropArea.classList.add('dropArea');
        fileUploadView.appendChild(dropArea);

        const dropImage = document.createElement('img');
        dropImage.classList.add('dropImage');
        dropArea.appendChild(dropImage);

        const dropTitle = document.createElement('h5');
        dropTitle.classList.add('dropTitle');
        dropTitle.innerText = this.__dropTitle__;
        dropArea.appendChild(dropTitle);

        const or = document.createElement('p');
        or.classList.add('or');
        or.innerText = this.__or__;
        dropArea.appendChild(or);

        const label = document.createElement('label');
        label.style.padding = "20px";
        dropArea.appendChild(label);

        const fileInput = document.createElement('input');
        fileInput.type = "file";
        fileInput.id = "upload";
        fileInput.classList.add('browseButton');
        fileInput.style.display = "none";
        label.appendChild(fileInput);

        const browseButton = document.createElement('span');
        browseButton.classList.add('browseButton');
        browseButton.innerText = this.__browseButtonTitle__;
        label.appendChild(browseButton);

        const uploadedFilesTable = document.createElement('div');
        uploadedFilesTable.id = this.__uploadedFilesTableId__;
        fileUploadView.appendChild(uploadedFilesTable);
    }

    /**
     * DOM nodes as variables.
     */
    _setElements() {
        // fileUploadView
        this.$fileUploadView = document.getElementById(this.__id__);
        if (this.$fileUploadView == null) {
            console.warn(
                `<section id=${this.__id__} class=fileUploadView></section> is necessary in HTML.`);
        }
        // title
        this.$title = this.$fileUploadView.querySelector('.title');
        if (this.$title == null) {
            console.warn(
                `<h6 class=title> is necessary in HTML.`);
        }
        this.$dropArea = this.$fileUploadView.querySelector('.dropArea');
        if (this.$dropArea == null) {
            console.warn(
                `<div class=dropArea>is necessary in HTML.`);
        }
        this.$browseButton = document.getElementById('upload');
        if (this.$browseButton == null) {
            console.warn(
                `<div class=dropArea>is necessary in HTML.`);
        }
      
        // TODO: other validations
    }

    /**
     * Initialize the layout for display.
     */
    _initLayout() {
    }

    /**
     * Set event handlers.
     */
    _setEventHandlers() {
        const _this = this;
   
        // dragover event handler
        this.$dropArea.addEventListener('dragover', (e) => {
            console.log(`a file is dropped down on the droparea.`); 
   
            e.preventDefault();
        });
        
        // drop event handler
        this.$dropArea.addEventListener('drop', (e) => {
            console.log(`a file is dropped down on the droparea.`);  

            const files = e.dataTransfer.files;

            // Get a reference to the file
            var file = files[0];

            // Get a reference to the filename
            var filename = file.name;

            //Add file cell to table
            this._addFileUploadCell(file, filename)
            this.controller.fileUploadViewFileUploaded(this, file); // <-- protocol function call

            e.preventDefault(); 
        });  

        // browse button handler
        this.$browseButton.onchange = () => {
            const file = this.$browseButton.files[0];
            var data = new FormData();

            // Create a XMLHTTPRequest instance
            var request = new XMLHttpRequest();

            request.responseType = "json";

            // Get a reference to the filename
            var filename = file['name'];
            this._addFileUploadCell(file, filename);
        }

        //TODO : function to get file icon by type 
        function getFileTypeEnumKeys(fileType) {
            return Object.keys(FileType);
          }

    }

    _addFileUploadCell(file, fileName){

        // fetch file extension
        const ext = getFileExtension(fileName);

        // add file upload cell to table
        var cell = new FileUploadTableViewCell(this.__uploadedFilesTableId__, this.__cell_index__);
        cell.content = fileName;
        this._setFileUploadCellEventHandler(cell)
        this.__cells__.push(cell)
        this.__cell_index__ +=1;

        // used for the purpose of upload indicator demo
        var width = 1;
        var identity = setInterval(scene, 50);
        function scene() {
          if (width >= 100) {
            clearInterval(identity);
          } else {
            width++; 
            cell.state = width + '%'; 
          }
        }

        // function to get file extension
        function getFileExtension(fileName){ 
            const lastDot = fileName.lastIndexOf('.');

            const ext = fileName.substring(lastDot + 1);
            return ext;
        }

        // function to upload to s3
        function getSignedRequest(file){
            var xhr = new XMLHttpRequest();
            xhr.open("GET", "/v1/organizations/documents/upload?file_name="+file.name+"&file_type="+file.type);

            // TODO: connect upload file to aws
            xhr.onreadystatechange = function(){
              if(xhr.readyState === 4){
                  console.log(xhr.status);
                if(xhr.status === 200){
                  var response = JSON.parse(xhr.responseText);
                  //TODO: progress bar state update
                }
                else{
                  alert("Could not get signed URL.");
                }
              }
            };
             xhr.send();
          }      
    }

    _setFileUploadCellEventHandler(cell){
        console.log(document.getElementById(cell.__id__));

        console.log(`set event for ${cell.__id__}`);
            currentCell = document.getElementById(cell.__id__);
            currentCell.querySelector('.close-icon').addEventListener('click', e => {
                console.log(`cell ${cell.__id__} clicked`);
                currentCell.remove()
                this.controller.fileUploadViewFileRemoved(this, cell); // <-- protocol function call
            });
    }


    /* public functions */

    /**
     * Add/Remove alert.
     * 

     * @param {bool} onAlert 
     * @param {string} message
     */
    alert(onAlert, message) {
        // TODO:
    }
}

 class FileUploadViewProtocol {
    /**
     * To be overridden in the ViewController. 
     * Called when the state of the FileUploadView changes.
     * 
     * @param {FileUploadView} fileUploadView - The FileUploadView that triggered the event.
     * @param {string} state - The current state of the FileUploadView.
     * @throws {Error} If the method is not overridden in the ViewController.
     */
    fileUploadViewStateChange(fileUploadView, state) {
        throw new Error(`ViewController of FileUploadView ${fileUploadView.__id__} must implement _fileUploadViewStateChange method!`);
    }

    /**
     * To be overridden in the ViewController. 
     * Called when a new file is uploaded via the FileUploadView.
     * 
     * @param {FileUploadView} fileUploadView - The FileUploadView that triggered the event.
     * @param {File} file - The file that was uploaded.
     * @throws {Error} If the method is not overridden in the ViewController.
     */
    fileUploadViewFileUploaded(fileUploadView, file) {
        throw new Error(`ViewController of FileUploadView ${fileUploadView.__id__} must implement _fileUploadViewFileUploaded method!`);
    }

    /**
     * To be overridden in the ViewController. 
     * Called when the FileUploadView is focused or loses focus.
     * 
     * @param {FileUploadView} fileUploadView - The FileUploadView that triggered the event.
     * @param {boolean} focus - true if the FileUploadView is currently focused, false otherwise.
     * @throws {Error} If the method is not overridden in the ViewController.
     */
    fileUploadViewFocusChange(fileUploadView, focus) {
        throw new Error(`ViewController of FileUploadView ${fileUploadView.__id__} must implement _fileUploadViewFocusChange method!`);
    }

    /**
     * To be overridden in the ViewController. 
     * Called when a file upload cell is removed from the FileUploadView.
     * 
     * @param {FileUploadView} fileUploadView - The FileUploadView that triggered the event.
     * @param {FileUploadTableViewCell} cell - The cell that was removed.
     * @throws {Error} If the method is not overridden in the ViewController.
     */
    fileUploadViewFileRemoved(fileUploadView, cell) {
        throw new Error(`ViewController of FileUploadView ${fileUploadView.__id__} must implement _fileUploadViewFileRemoved method!`);
    }
}


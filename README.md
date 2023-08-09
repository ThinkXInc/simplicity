# Simplicity

**Simplicity is a fast, simple, and universal Web UI Framework** designed for creating responsive and interactive web applications with ease. It aids developers in constructing web forms, capturing user input, handling validation, and ensuring smooth user experience with minimal boilerplate.


## **Table of Contents**
- [Getting Started](#getting-started)
- [Usage Examples](#usage-examples)
    - [Define a Custom View Controller](#define-a-custom-view-controller)
    - [Run in HTML](#run-in-html)
- [Directory Structure](#directory-structure)
- [References](#references)
- [License](#license)


## **Getting Started**

### Prerequisites
Ensure you have [Node.js](https://nodejs.org/ja/download/) (version >= 14.17.0) installed.

```bash
$ npm -v
```

### Installation
First, clone or download the Simplicity repository. Navigate to your project directory and include the Simplicity sources:

```html
<link rel="stylesheet" href="/js/simplicity/dist/simplicity_default.css">
<script src="/js/simplicity/dist/simplicity.js"></script>
```


## **Usage Examples**

#### **1. Define a Custom View Controller**

Simplicity's `InputPageViewController` is a versatile class for creating various form interactions. The example below illustrates creating a custom inquiry form:

```javascript
class InquiryDataModel extends InputPageViewDataModel {
    // Define your model fields
    // ...

    constructor(defaults = {}) {
        super(defaults);
        Object.assign(this, defaults);
    }
}

class InquiryViewController extends InputPageViewController {
    constructor( /* parameters */ ) {
        // Initialize variables, validators, pages, etc.
        // ...
        super( /* parameters */ );
    }

    // Handle events like text field changes, completions, etc.
    // ...
}

// Then instantiate and use the custom view controller in your project.
```

For the complete code, see the provided draft.

#### **2. Run in HTML**

Integrate your custom view controller into an HTML structure:

```html
<section id=content></section>
<script src=/js/view_controllers/inquiry_view_controller.js></script>
<script>
    // Initialization code
    // ...
    let inquiryViewController = new InquiryViewController(/* parameters */);
</script>
```

For the complete code, see the provided draft.


## **Directory Structure**

The Simplicity project is structured as follows:

```
.
├── LICENCE
├── README.md
├── css
│   └── simplicity_default.css
├── dist
│   ├── simplicity.js
│   ├── simplicity.js.map
│   ├── simplicity_default.css
│   └── simplicity_default.css.map
├── gulpfile.js
├── less
│   ├── ... (Less files for styling)
├── package-lock.json
├── package.json
└── src
    ├── ... (Framework's source files)
```

For bundle mechanisms and including files in your project, utilize `gulpfile.js` provided in the repository.


## **References**

- [Node.js Installation](https://nodejs.org/ja/download/)


## **License**

Proprietary License

Copyright © ThinkX, Inc. All Rights Reserved.

This software and associated documentation files (the "Software") are proprietary to ThinkX, Inc., and are not to be copied, reproduced, transmitted, disseminated, reverse-engineered, or used in any way unless expressly permitted by ThinkX, Inc.

Use of this software is subject to the terms and conditions of a legal agreement between you and ThinkX, Inc. Unauthorized use of this software may cause ThinkX, Inc. to assert its legal rights to the fullest extent of the law, and you may be subject to penalties.

##
Develop with simplicity in mind.

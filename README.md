![Mozilla Add-on](https://img.shields.io/amo/dw/webmail-ad-blocker?style=for-the-badge) ![Mozilla Add-on](https://img.shields.io/amo/stars/dustman?style=for-the-badge)
# React custom scrollbar ⚡

## Props/Options
+ className = "scrollbar" (string)
+ disabled = false (boolean, use this to disable scroll on for example integrating menus with this)
+ height = "content" (content or any acceptable css value for height)
+ autohide = 0 (integer)

## Styling 💅
Easiest way is just to edit the provided scss file manually or hook use classname provided in the component props with you own css file

## Usage:
```javascript
import CustomScrollbar from './components/CustomScrollbar';

const Component = (
  <CustomScrollbar height="250vh" shouldRender={ isDesktop } autohide={ 1500 }>
    // Content goes here...
  </CustomScrollbar>
)
```

## Installment
Just download all the files in this repository and put them in ur prefered folders. Just make sure the dependecies has the correct paths 😎

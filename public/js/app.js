/**
 * main.js
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2015, Codrops
 * http://www.codrops.com
 */
;(function(window) {

  'use strict';

  var CardTemplate = Handlebars.compile($('#card-template').html()),
    StoryTemplate = Handlebars.compile($('#story-template').html());


  var cards = 'https://docs.google.com/spreadsheets/d/1I990DgoSP3UBLnkq5YFOlkZsGcx8s3wWh2shXWfTrnU/edit#gid=710258766',
    stories = 'https://docs.google.com/spreadsheets/d/1I990DgoSP3UBLnkq5YFOlkZsGcx8s3wWh2shXWfTrnU/edit#gid=725026563';


  $('.grid').sheetrock({
      url: cards,
      query: "select *",
      rowHandler : CardTemplate,
      callback: init
  });

    var bodyEl = document.body,
      docElem = window.document.documentElement,
      support = { transitions: Modernizr.csstransitions },
      // transition end event name
      transEndEventNames = { 'WebkitTransition': 'webkitTransitionEnd', 'MozTransition': 'transitionend', 'OTransition': 'oTransitionEnd', 'msTransition': 'MSTransitionEnd', 'transition': 'transitionend' },
      transEndEventName = transEndEventNames[ Modernizr.prefixed( 'transition' ) ],
      onEndTransition = function( el, callback ) {
        var onEndCallbackFn = function( ev ) {
          if( support.transitions ) {
            if( ev.target != this ) return;
            this.removeEventListener( transEndEventName, onEndCallbackFn );
          }
          if( callback && typeof callback === 'function' ) { callback.call(this); }
        };
        if( support.transitions ) {
          el.addEventListener( transEndEventName, onEndCallbackFn );
        }
        else {
          onEndCallbackFn();
        }
      },
      gridEl = document.getElementById('theGrid'),
      sidebarEl = document.getElementById('theSidebar'),
      gridItemsContainer = gridEl.querySelector('section.grid'),
      contentItemsContainer = gridEl.querySelector('section.content'),
      gridItems, contentItems,
      closeCtrl = contentItemsContainer.querySelector('.close-button'),
      current = -1,
      lockScroll = false, xscroll, yscroll,
      isAnimating = false,
      menuCtrl = document.getElementById('menu-toggle'),
      menuCloseCtrl = sidebarEl.querySelector('.close-button'),
      // Isotope instance
      iso,
      // filter ctrls
      filterCtrls = [].slice.call(document.querySelectorAll('.filter > button'));

    /**
     * gets the viewport width and height
     * based on http://responsejs.com/labs/dimensions/
     */

    function getViewport( axis ) {
      var client, inner;
      if( axis === 'x' ) {
        client = docElem['clientWidth'];
        inner = window['innerWidth'];
      }
      else if( axis === 'y' ) {
        client = docElem['clientHeight'];
        inner = window['innerHeight'];
      }
      
      return client < inner ? inner : client;
    }
    function scrollX() { return window.pageXOffset || docElem.scrollLeft; }
    function scrollY() { return window.pageYOffset || docElem.scrollTop; }

    function init() {



      $('.scroll-wrap').sheetrock({
        url: stories,
        query: "select *",
          rowHandler : StoryTemplate,
          callback: initEvents
      });

      iso = new Isotope( gridItemsContainer, {
        isResizeBound: true,
        itemSelector: '.grid__item',
        percentPosition: false,
        masonry: {
          // use outer width of grid-sizer for columnWidth
          columnWidth: '.grid__sizer'
        },
        transitionDuration: '0.6s'
      });
    }


    function initEvents() {

      gridItems = gridItemsContainer.querySelectorAll('.grid__item');
      contentItems = contentItemsContainer.querySelectorAll('.content__item');

      // $(".grid__item").hover(function() { // Mouse over
      //   $(this).siblings().stop().fadeTo(300, 0.2);
      // }, function() { // Mouse out
      //   $(this).siblings().stop().fadeTo(300, 1);
      // });

      filterCtrls.forEach(function(filterCtrl) {

        filterCtrl.addEventListener('click', function() {
          classie.remove(filterCtrl.parentNode.querySelector('.filter__item--selected'), 'filter__item--selected');
          classie.add(filterCtrl, 'filter__item--selected');
          iso.arrange({
            filter: filterCtrl.getAttribute('data-filter')
          });
          iso.layout();
        });
      });

      

      [].slice.call(gridItems).forEach(function(item, pos) {


        console.log(item);
        // grid item click event
        item.addEventListener('click', function(ev) {

          ev.preventDefault();
          if(isAnimating || current === pos) {
            return false;
          }
          isAnimating = true;
          // index of current item
          current = pos;
          // simulate loading time..
          classie.add(item, 'grid__item--loading');
          setTimeout(function() {
            classie.add(item, 'grid__item--animate');
            // reveal/load content after the last element animates out (todo: wait for the last transition to finish)
            setTimeout(function() { loadContent(item); }, 500);
          }, 1000);
        });
      });

      closeCtrl.addEventListener('click', function() {
        // hide content
        hideContent();
      });

      // keyboard esc - hide content
      document.addEventListener('keydown', function(ev) {
        if(!isAnimating && current !== -1) {
          var keyCode = ev.keyCode || ev.which;
          if( keyCode === 27 ) {
            ev.preventDefault();
            if ("activeElement" in document)
                document.activeElement.blur();
            hideContent();
          }
        }
      } );

      // hamburger menu button (mobile) and close cross
      menuCtrl.addEventListener('click', function() {
        if( !classie.has(sidebarEl, 'sidebar--open') ) {
          classie.add(sidebarEl, 'sidebar--open');  
        }
      });

      menuCloseCtrl.addEventListener('click', function() {
        if( classie.has(sidebarEl, 'sidebar--open') ) {
          classie.remove(sidebarEl, 'sidebar--open');
        }
      });
    }



    function loadContent(item) {
      
      // add expanding element/placeholder 
      var dummy = document.createElement('div');
      dummy.className = 'placeholder';

      // set the width/heigth and position
      dummy.style.WebkitTransform = 'translate3d(' + (item.offsetLeft - 5) + 'px, ' + (item.offsetTop - 5) + 'px, 0px) scale3d(' + item.offsetWidth/gridItemsContainer.offsetWidth + ',' + item.offsetHeight/getViewport('y') + ',1)';
      dummy.style.transform = 'translate3d(' + (item.offsetLeft - 5) + 'px, ' + (item.offsetTop - 5) + 'px, 0px) scale3d(' + item.offsetWidth/gridItemsContainer.offsetWidth + ',' + item.offsetHeight/getViewport('y') + ',1)';

      // add transition class 
      classie.add(dummy, 'placeholder--trans-in');

      // insert it after all the grid items
      gridItemsContainer.appendChild(dummy);
      
      // body overlay
      classie.add(bodyEl, 'view-single');

      setTimeout(function() {
        // expands the placeholder
        dummy.style.WebkitTransform = 'translate3d(-5px, ' + (scrollY() - 5) + 'px, 0px)';
        dummy.style.transform = 'translate3d(-5px, ' + (scrollY() - 5) + 'px, 0px)';
        console.log(scrollY());
        // disallow scroll
        window.addEventListener('scroll', noscroll);
      }, 25);

      onEndTransition(dummy, function() {
        // add transition class 
        classie.remove(dummy, 'placeholder--trans-in');
        classie.add(dummy, 'placeholder--trans-out');
        // position the content container
        contentItemsContainer.style.top = scrollY() + 'px';
        // show the main content container
        classie.add(contentItemsContainer, 'content--show');
        // show content item:
        classie.add(contentItems[current], 'content__item--show');
        // show close control
        classie.add(closeCtrl, 'close-button--show');
        // sets overflow hidden to the body and allows the switch to the content scroll
        classie.addClass(bodyEl, 'noscroll');

        isAnimating = false;
      });
    }

    function hideContent() {
      var gridItem = gridItems[current], contentItem = contentItems[current];

      classie.remove(contentItem, 'content__item--show');
      classie.remove(contentItemsContainer, 'content--show');
      classie.remove(closeCtrl, 'close-button--show');
      classie.remove(bodyEl, 'view-single');

      setTimeout(function() {
        var dummy = gridItemsContainer.querySelector('.placeholder');

        classie.removeClass(bodyEl, 'noscroll');

        dummy.style.WebkitTransform = 'translate3d(' + gridItem.offsetLeft + 'px, ' + gridItem.offsetTop + 'px, 0px) scale3d(' + gridItem.offsetWidth/gridItemsContainer.offsetWidth + ',' + gridItem.offsetHeight/getViewport('y') + ',1)';
        dummy.style.transform = 'translate3d(' + gridItem.offsetLeft + 'px, ' + gridItem.offsetTop + 'px, 0px) scale3d(' + gridItem.offsetWidth/gridItemsContainer.offsetWidth + ',' + gridItem.offsetHeight/getViewport('y') + ',1)';

        onEndTransition(dummy, function() {
          // reset content scroll..
          contentItem.parentNode.scrollTop = 0;
          gridItemsContainer.removeChild(dummy);
          classie.remove(gridItem, 'grid__item--loading');
          classie.remove(gridItem, 'grid__item--animate');
          lockScroll = false;
          window.removeEventListener( 'scroll', noscroll );
        });
        
        // reset current
        current = -1;
      }, 25);
    }

    function noscroll() {
      if(!lockScroll) {
        lockScroll = true;
        xscroll = scrollX();
        yscroll = scrollY();
      }
      window.scrollTo(xscroll, yscroll);
    }


 /*

  var support = { animations : Modernizr.cssanimations },
    animEndEventNames = { 'WebkitAnimation' : 'webkitAnimationEnd', 'OAnimation' : 'oAnimationEnd', 'msAnimation' : 'MSAnimationEnd', 'animation' : 'animationend' },
    animEndEventName = animEndEventNames[ Modernizr.prefixed( 'animation' ) ],
    onEndAnimation = function( el, callback ) {
      var onEndCallbackFn = function( ev ) {
        if( support.animations ) {
          if( ev.target != this ) return;
          this.removeEventListener( animEndEventName, onEndCallbackFn );
        }
        if( callback && typeof callback === 'function' ) { callback.call(); }
      };
      if( support.animations ) {
        el.addEventListener( animEndEventName, onEndCallbackFn );
      }
      else {
        onEndCallbackFn();
      }
    };

  // from http://www.sberry.me/articles/javascript-event-throttling-debouncing
  function throttle(fn, delay) {
    var allowSample = true;

    return function(e) {
      if (allowSample) {
        allowSample = false;
        setTimeout(function() { allowSample = true; }, delay);
        fn(e);
      }
    };
  }

  
  function done () {
    // sliders - flickity
    var sliders = [].slice.call(document.querySelectorAll('.slider')),
      // array where the flickity instances are going to be stored
      flkties = [],
      // grid element
      grid = document.querySelector('.grid'),
      // isotope instance
      iso,
      // filter ctrls
      filterCtrls = [].slice.call(document.querySelectorAll('.filter > button'));
      // cart
      // cart = document.querySelector('.cart'),
      // cartItems = cart.querySelector('.cart__count');

    function init() {
      // preload images
      imagesLoaded(grid, function() {
        initFlickity();
        initIsotope();
        initEvents();
        classie.remove(grid, 'grid--loading');
      });
    }

    function initFlickity() {
      sliders.forEach(function(slider){
        var flkty = new Flickity(slider, {
          prevNextButtons: false,
          wrapAround: true,
          cellAlign: 'left',
          contain: true,
          resize: false
        });

        // store flickity instances
        flkties.push(flkty);
      });
    }

    function initIsotope() {
      iso = new Isotope( grid, {
        isResizeBound: true,
        itemSelector: '.grid__item',
        percentPosition: true,
        masonry: {
          // use outer width of grid-sizer for columnWidth
          columnWidth: '.grid__sizer'
        },
        transitionDuration: '0.6s'
      });
    }

    function initEvents() {
      filterCtrls.forEach(function(filterCtrl) {
        filterCtrl.addEventListener('click', function() {
          classie.remove(filterCtrl.parentNode.querySelector('.filter__item--selected'), 'filter__item--selected');
          classie.add(filterCtrl, 'filter__item--selected');
          iso.arrange({
            filter: filterCtrl.getAttribute('data-filter')
          });
          recalcFlickities();
          iso.layout();
        });
      });

      // window resize / recalculate sizes for both flickity and isotope/masonry layouts
      window.addEventListener('resize', throttle(function(ev) {
        recalcFlickities()
        iso.layout();
      }, 50));

      // add to cart
      // [].slice.call(grid.querySelectorAll('.grid__item')).forEach(function(item) {
      //  item.querySelector('.action--buy').addEventListener('click', addToCart);
      // });
    }

    function addToCart() {
      classie.add(cart, 'cart--animate');
      setTimeout(function() {cartItems.innerHTML = Number(cartItems.innerHTML) + 1;}, 200);
      onEndAnimation(cartItems, function() {
        classie.remove(cart, 'cart--animate');
      });
    }

    function recalcFlickities() {
      for(var i = 0, len = flkties.length; i < len; ++i) {
        flkties[i].resize();
      }
    }
      init();
  }
  
  */


})(window);
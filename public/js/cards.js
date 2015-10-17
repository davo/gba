/**
 * cards.js
 * http://www.codrops.com
 * Based on: http://tympanus.net/codrops/2015/04/15/grid-item-animation-layout/
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
    stories = 'https://docs.google.com/spreadsheets/d/1I990DgoSP3UBLnkq5YFOlkZsGcx8s3wWh2shXWfTrnU/edit#gid=725026563',
    cardsToStories = [[0,0],[1,0],[2,0],[3,1],[4,1],[5,1],[6,1],[7,2],[8,2],[9,2],[10,3],[11,3],[12,4],[13,5],[14,5],[15,5],[16,6],[17,6],[18,6],[19,7],[20,7],[21,8],[22,8],[23,8],[24,9],[25,9],[26,10],[27,10],[28,11],[29,11],[30,11],[31,11],[32,11],[33,12],[34,12],[35,12],[36,13],[37,13],[38,13]];

    // console.log(cardsToStories[9][1])


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
      currentCard, selectedStory,
      // Isotope instance
      iso,
      // filter ctrls
      filterCtrls = [].slice.call(document.querySelectorAll('.filter > button')),

      cardsContentNav = [];
      // orderCtrls = [].slice.call(document.querySelectorAll('.order > button'));

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

    var checkComma = /(,)/g

      // $('#theGrid').on('scroll',function(){ console.log(scrollTop); })

    // Instancio y ejecuto las cards desde el spreadsheet gestionado por sheetrock, luego ejecuto funcion para concatenar con la segundo generación de contenidos.

    $('.grid').sheetrock({
        url: cards,
        headers: 1,
        query: "select *",
        rowHandler : CardTemplate,
        callback: init
    });


    function crearNavegador(data) {
      // console.log(cardsContentNav);
    }


    var cargarCardsEnArray = function(error, options, response) {
        if (!error) {
            // hayDatos = true;

            $.each(response.rows, function(index, value) {
                // las propiedades de las celdas son los titulos del spreadsheet
                // y son case sensitive (no usar espacios ni caracteres raros)
                var fila = [
                    value.cells.orden,
                    value.cells.dataviz_key,
                    value.cells.eje,
                    value.cells.eje_key,
                    value.cells.indicador_a,
                    value.cells.indicador_b,
                    value.cells.indicador_c,
                    value.cells.filtro,
                    value.cells.titulo,
                    value.cells.contenido,
                    value.cells.criterio_visualizacion

               ];
                if (index === 0) {
                  console.log('Skipping header!');
                } else if (index === 1) {
                  console.log('Skipping zero value!');
                } else {
                  cardsContentNav.push(fila);
                }
            });
        } else {
          console.log(error);
        }
        crearNavegador(cardsContentNav);

    };


  
      

    // Abstract: Selecciona el navegador creado por StoryTemplate
    // y extrae los valores de los cards internos. Luego convierte
    // en Array.

    function currentNav() {

      // El criterio para crear esta funcion fue el siguiente:
      // Asumimos que en el spreadsheet "stories", hay una columna 'cards' y extraemos sus valores (separados por coma)
      // Iteramos desde el spreadshhet "cards" para matchear el contenido de la columna "cards" (spreadsheet stories) con
      // los objetos que necesitamos para la interfaz.

      console.table(cardsContentNav);

      // var nav, navegador cuyo contenido son los cards relacionados entre si atraves de una full story.
      var nav = $(".content__item--show").find("#cardNav");
      // var list, placeholder donde van a ir en formato de lista el contenido de los cards relacionados/
      var list = nav.find(".tabs-navigation");
      // getCambiador, select donde arrojaremos la lista de opciones basadas en los criterios a visualizar.
      var getCambiador = $("#cambiador");
      console.log(getCambiador);
      // cardContent, array donde arrojaremos el contenido de los cards que corresponden.
      var cardContent = [];

      // selectedNav, get de lista con los cards arrojados por mustache en story-template.
      var selectedNav = nav.data("cards");

      if(!selectedNav.includes(',')) {
        // Alerta, bug en el Card 12 que es una card que no comparte Full Story. Rompe el patron. Revisar y corregir.
        console.log('No comma!');
      } else {
        selectedNav = selectedNav.split(",");
      }

      // Creo una lista de options 
      function createVizOptions(i) {
        var optionItem;
        optionItem = '<option value='+cardsContentNav[cardContent[i]][10]+' filtro="'+cardsContentNav[cardContent[i]][7]+'">'+cardsContentNav[cardContent[i]][9]+'</option>';
        $(optionItem).appendTo(getCambiador);
        console.log(cardsContentNav[cardContent[i]][10]);
      }
      
      function createNav(i) {
        var listItem;
        listItem = '<li><a href=\"\">'+cardsContentNav[cardContent[i]][8]+'</a></li>';
        $(listItem).appendTo(list);
      }



      // console.table(selectedNav);

      for (var i = 0; i < selectedNav.length; i++) {
          var getCard = parseInt(selectedNav[i]);
          cardContent.push(getCard);
          createNav(i);
          createVizOptions(i)
      }
      // $.each(selectedNav,function(i,cardContent){
        
      // })

      armaVisualizacion();
    }

    function cargaDatosNav() {
      var archivo = sheetrock({
          url: cards,
          headers: 1,
          query: "select A,B,D,E,F,G,H,I,K,M,O",
          callback: cargarCardsEnArray
      });
    }



    function init() {

      cargaDatosNav();



      // Instancio y ejecuto las full stories desde el 2do. spreadsheet gestionado por sheetrock, concateno con funciones . Luego se ejecuta isotope

      $('.scroll-wrap').sheetrock({
        url: stories,
        headers: 1,
        query: "select *",
        rowHandler : StoryTemplate,
        callback: initEvents
      });
      // Close init();
    }


    function initEvents() {

      

      

      iso = new Isotope( gridItemsContainer, {
        getSortData: {
            prioridad: '[data-prioridad]'
        },
        isResizeBound: true,
        itemSelector: '.grid__item',
        percentPosition: false,
        sortBy: 'prioridad',
        masonry: {
          // use outer width of grid-sizer for columnWidth
          columnWidth: '.grid__sizer'
        },
        transitionDuration: '0.6s'
      });

      window.addEventListener('resize', throttle(function(ev) {
        iso.layout();
      }, 50));

      gridItems = gridItemsContainer.querySelectorAll('.grid__item');
      contentItems = contentItemsContainer.querySelectorAll('.content__item');

      // console.log(contentItems);

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

      // orderCtrls.forEach(function(orderCtrl){
      //   orderCtrl.addEventListener('click', function(){
      //       console.log('Click en orden')
      //       iso.arrange({
      //           orderBy: orderCtrl.getAttribute('data-order')
      //       });
      //       iso.layout();
      //       console.log(iso)
      //   });
      // });



      [].slice.call(gridItems).forEach(function(item, pos) {


        // console.log(item);

        // grid item click event
        item.addEventListener('click', function(ev) {

          selectedStory = cardsToStories[pos][1];
          currentCard = cardsToStories[pos][0];

          ev.preventDefault();
          // if(isAnimating || current === pos) {
          if(isAnimating || current === currentCard) {
            return false;
          }
          isAnimating = true;
          // index of current item

          current = selectedStory;
          // console.log('Posicion: '+pos,', Card clickeada: '+currentCard, ', Story seleccionada: '+selectedStory);

          // simulate loading time..
          classie.add(item, 'grid__item--loading');
          setTimeout(function() {
            classie.add(item, 'grid__item--animate');
            // reveal/load content after the last element animates out (todo: wait for the last transition to finish)
            setTimeout(function() { loadContent(item); }, 200);
          }, 1000);
        });
      });

      closeCtrl.addEventListener('click', function() {
        // hide content
        hideContent();
        // hide graph
        $("svg").remove();
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
      });

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

    // console.log(window.pageYOffset);

    function loadContent(item) {

      // add expanding element/placeholder
      var dummy = document.createElement('div');
      dummy.className = 'placeholder';

      // set the width/heigth and position
      dummy.style.WebkitTransform = 'translate3d(' + (item.offsetLeft - 5) + 'px, ' + (item.offsetTop - 5) + 'px, 0px) scale3d(' + item.offsetWidth/gridItemsContainer.offsetWidth + ',' + item.offsetHeight/getViewport('y') + ',1)';
      dummy.style.transform = 'translate3d(' + (item.offsetLeft - 5) + 'px, ' + (item.offsetTop - 5) + 'px, 0px) scale3d(' + item.offsetWidth/gridItemsContainer.offsetWidth + ',' + item.offsetHeight/getViewport('y') + ',1)';

      // console.log('translate3d(' + (item.offsetLeft - 5) + 'px, ' + (item.offsetTop - 5) + 'px, 0px) scale3d(' + item.offsetWidth/gridItemsContainer.offsetWidth + ',' + item.offsetHeight/getViewport('y') + ',1)');

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

        // console.log('translate3d(-5px, ' + (scrollY() - 5) + 'px, 0px)');

        // console.log(scrollY());
        // disallow scroll
        window.addEventListener('scroll', noscroll);
      }, 25);

      onEndTransition(dummy, function() {
        // add transition class
        classie.remove(dummy, 'placeholder--trans-in');
        classie.add(dummy, 'placeholder--trans-out');
        // position the content container

        contentItemsContainer.style.top = scrollY() + 'px';

        // console.log(scrollY() + 'px');
        
        // show the main content container
        classie.add(contentItemsContainer, 'content--show');
        // show content item:
        classie.add(contentItems[current], 'content__item--show');
        // show close control
        classie.add(closeCtrl, 'close-button--show');
        // sets overflow hidden to the body and allows the switch to the content scroll
        classie.addClass(bodyEl, 'noscroll');

        classie.addClass(bodyEl, 'selectedStory'+selectedStory);

        classie.addClass(bodyEl, 'currentCard'+currentCard);

        // var newNav = '#currentCard'+currentCard;

        currentNav();
  
        //arma la visualizacion una vez armado el card
        

        isAnimating = false;
      });
    }

    function hideContent() {
      var gridItem = gridItems[currentCard], contentItem = contentItems[current];



      classie.remove(contentItem, 'content__item--show');
      classie.remove(contentItemsContainer, 'content--show');
      classie.remove(closeCtrl, 'close-button--show');
      classie.remove(bodyEl, 'view-single');

      setTimeout(function() {
        var dummy = gridItemsContainer.querySelector('.placeholder');

        classie.removeClass(bodyEl, 'noscroll');

        classie.removeClass(bodyEl, 'selectedStory'+selectedStory);

        classie.removeClass(bodyEl, 'currentCard'+currentCard);


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

$(() => {
  "use strict";

  $('.u-anim.nav-lnk').click((e) => {
    $('.menu').toggleClass('menu-active');
    $('.menu-animated-background').toggleClass('menu-animated-background-active');
    $('.menu-navigation').toggleClass('active');
    $('body').toggleClass('no-scroll');
  });

  $('.menu').click((e) => {
    e.preventDefault();
    $('.menu').toggleClass('menu-active');
    $('.menu-animated-background').toggleClass('menu-animated-background-active');
    $('.menu-navigation').toggleClass('active');
    $('body').toggleClass('no-scroll');
  });

  // affix

  $(() => {
      $(".element").typed({
        strings: ["Branding ^1000 stuff. ", "Cool ^1000Websites.^2200", "UI/^800UX.", "Various ^500Stuff"],
        typeSpeed: 10,
        backDelay: 800
      });
  });
});

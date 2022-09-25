const isDev = false;

const colorTranslatedText = '#a561be';

const extOptions = {
  preventTitleTranslate: true,
  skipDomain: [
    'localhost',
    'jsfiddle.net',
    'codepen.io',
    'codeburst.io',
    'atavi.com',
    'codesandbox.io',
    'youtube.com'
  ]
};

function showBorder(element, selector = '') {
  try {
    element.style.border = '2px dotted red';
    showSelector(element, selector);
  } catch (err) {
    toastr.error(`[showBorder]:
    originError: ${err.message}
    selector: ${selector}
    `);
  }

  function showSelector(element, selector) {
    element.style.position = 'relative';

    const hint = document.createElement('span');
    hint.textContent = selector;
    hint.setAttribute(
      'style',
      `
    position: absolute;
    top: 0;
    left: 0;
    color: while;
    font-size: 1em;
    background-color: red;
    `
    );
    element.appendChild(hint);
  }
}

(function() {
  try {
    launch();
  } catch (err) {
    toastr.error(`${err.message}` || 'ERROR: display two languages');
    console.error(err);
  }

  function launch() {
    const { skipDomain } = extOptions;
    const hostname = window.location.hostname;

    if (skipDomain.includes(hostname)) {
      return;
    }

    display_two_languages(extOptions);
  }
})();

function display_two_languages(extOptions) {
  const MAIN_CONTENT_SELECTORS = {
    tagsShouldBeOne: [
      'article',
      '#content',
      '#primary',
      '.main',
      '#main',
      '.container',
      'main'
    ]
  };

  extOptions.preventTitleTranslate && preventTitleTranslate();

  let shouldUseUniversalHandler = switchHandler();

  shouldUseUniversalHandler &&
  launchUniversalHandler(MAIN_CONTENT_SELECTORS, extOptions);
}

function preventTranslateElem(elem) {
  if (elem) {
    elem.setAttribute('translate', 'no');
    elem.classList.add('notranslate');
  }
}

function launchUniversalHandler(MAIN_CONTENT_SELECTORS, extOptions) {
  const context = getMainContext(extOptions, MAIN_CONTENT_SELECTORS);
  launchTagsHandlersByRules(context);
}

function switchHandler() {
  let shouldUseUniversalHandler = true;
  const href = window.location.href;
  const location = window.location;

  if (href.startsWith('https://www.google.com/search?')) {
    shouldUseUniversalHandler = false;
    handleGoogleSearchPage();
    return shouldUseUniversalHandler;
  }

  if (href.startsWith('https://github.com/')) {
    shouldUseUniversalHandler = false;
    handleGithub();
    return shouldUseUniversalHandler;
  }

  if (location.hostname.includes('stackoverflow')) {
    shouldUseUniversalHandler = false;
    handleStackoverflow(location);
    return shouldUseUniversalHandler;
  }

  if (href.startsWith('https://gist.github.com/')) {
    shouldUseUniversalHandler = false;
    handleGistGithub();
    return shouldUseUniversalHandler;
  }

  return shouldUseUniversalHandler;
}

function handleGistGithub() {
  preventTranslateElem(document.body);
}

function handleStackoverflow(location) {
  if (location.host === 'ru.stackoverflow.com') {
    return;
  }

  switchStackoverflowPageHandlers(location);

  function switchStackoverflowPageHandlers(location) {
    if (location.pathname === '/search') {
      return handleSoSearchPage(location);
    }

    if (location.pathname.startsWith('/questions/')) {
      return handleQuestionPage(location);
    }
  }

  function handleSoSearchPage() {
    const selectors = getSelectors('searchPage');
    const resultsContainer = document.querySelector(selectors.resultsContainer);
    const results = resultsContainer.querySelectorAll(selectors.results);
    handleResults(results, selectors);

    function handleResults(results, selectors) {
      results.forEach(handleResult);

      function handleResult(result) {
        const summary = result.querySelector(selectors.summary);

        handleResultLink(summary, selectors);
        handleExcept(summary, selectors);
        handleTags(summary, selectors);
        handleStarted(summary, selectors);
      }

      function handleResultLink(summary, selectors) {
        const link = summary.querySelector(selectors.link);
        preventTranslateElem(link);
        const titleOrigin = link.querySelector(selectors.titleOrigin).title;

        let resultTitleCopyTranslate = document.createElement('P');
        resultTitleCopyTranslate.textContent = titleOrigin;
        resultTitleCopyTranslate.style.color = '#ffdb24';
        resultTitleCopyTranslate.style.fontSize = '17px';
        resultTitleCopyTranslate.style.display = 'inline-block';
        resultTitleCopyTranslate.style.margin = '0px 0px 7px 0px';
        insertAfter(resultTitleCopyTranslate, link);

        const elemWithOrigin = getElementForDisplayOriginText(titleOrigin);
        elemWithOrigin.style.margin = '-7px 0px 11px 0px';
        insertAfter(elemWithOrigin, link);
      }

      function handleExcept(summary, selectors) {
        const excerpt = summary.querySelector(selectors.excerpt);

        duplicateNoTranslate(excerpt, {
          preventTranslate: 'origin',
          delimiter: ''
        });

        excerpt.style.color = colorTranslatedText;
      }

      function handleTags(summary, selectors) {
        const tags = summary.querySelector(selectors.tags);
        preventTranslateElem(tags);
      }

      function handleStarted(summary, selectors) {
        const started = summary.querySelector(selectors.started);
        preventTranslateElem(started);
      }
    }
  }

  function handleQuestionPage() {
    const selectors = getSelectors('questionPage');
    const mainContent = document.querySelector(selectors.mainContent);

    handleQuestionInfo();

    const specificHandlers = {
      handle_h1: handleSO_h1,
      handleLists: () => {
      }
    };

    function handleSO_h1() {
      const h1 = document.querySelector('h1');

      if (!h1) {
        return;
      }

      preventTranslateElem(h1);
      h1.parentElement.style.flexFlow = 'column';

      const link = h1.querySelector('a');
      link.style.fontSize = '0.7em';
      const originText = link.textContent;
      const originElem = getElementForDisplayOriginText(originText);
      insertAfter(originElem, h1);

      const translated_h1 = document.createElement('SPAN');
      translated_h1.textContent = originText;
      translated_h1.setAttribute(
        'style',
        `
        font-size: 1.4em;
        color: #ffdb24;
        `
      );
      insertAfter(translated_h1, h1);
    }

    function handleQuestionInfo() {
      const question_header = document.querySelector('#question-header');
      if (!question_header) {
        return;
      }
      const info = question_header.nextElementSibling;
      preventTranslateElem(info);
      const time = info.querySelector('time');
      time.style.color = 'cyan';
    }

    launchTagHandlers(mainContent, specificHandlers);
  }

  function getSelectors(page) {
    const SELECTORS = {
      searchPage: {
        desktop: {
          resultsContainer: 'div.js-search-results>div',
          results: 'div.question-summary.search-result',
          summary: '.summary',
          link: '.result-link',
          titleOrigin: 'h3>a',
          excerpt: 'div.excerpt',
          tags: 'div.tags',
          started: 'div.started'
        },
        mobile: {
          resultsContainer: 'div.js-search-results',
          results: 'div.-search-result',
          summary: '.-details',
          link: 'h2',
          titleOrigin: 'a',
          excerpt: 'div.-excerpt',
          tags: 'div.-tags',
          started: '.-meta'
        }
      },
      questionPage: {
        desktop: {
          mainContent: '#content'
        },
        mobile: {
          mainContent: 'main'
        }
      }
    };

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      return SELECTORS[page].mobile;
    }
    //FOR DEVELOPMENT
    if (window.innerWidth < 768) {
      return SELECTORS[page].mobile;
    }

    return SELECTORS[page].desktop;
  }
}

function handleGoogleSearchPage() {
  const detectMobile = () => {
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  };

  if (detectMobile()) {
    return;
  }

  const selectors = getSelectors('searchPage');

  const resultsContainer = getElemBySelector(
    document.body,
    selectors.resultsContainer
  );
  handleResults(resultsContainer, selectors);

  function handleResults(resultsContainer, selectors) {
    const resultsElems = getElementsBySelector(
      resultsContainer,
      selectors.resultsElems
    );
    resultsElems.forEach(handleResult);

    function handleResult(result) {
      handleDisplayedLink(result, selectors);
      handleDescription(result, selectors);

      function handleDisplayedLink(result, selectors) {
        const links = getElementsBySelector(result, selectors.links);
        links.forEach(handleLink);

        function handleLink(link) {
          preventTranslateElem(link);
          const resultTitle = getElemBySelector(
            link,
            selectors.resultTitle,
            true
          );
          const resultTitleText = resultTitle.textContent;

          resultTitle.style.fontSize = '17px';
          resultTitle.style.display = 'inline-block';
          resultTitle.style.margin = '3px';

          let resultTitleCopyNotranslate = document.createElement('P');
          resultTitleCopyNotranslate.textContent = resultTitleText;
          preventTranslateElem(resultTitleCopyNotranslate);
          insertAfter(resultTitleCopyNotranslate, link);

          let resultTitleCopyTranslate = document.createElement('P');
          resultTitleCopyTranslate.textContent = resultTitleText;
          resultTitleCopyTranslate.style.color = '#ffdb24';
          resultTitleCopyTranslate.style.fontSize = '20px';
          resultTitleCopyTranslate.style.display = 'inline-block';
          resultTitleCopyTranslate.style.margin = '3px';
          insertAfter(resultTitleCopyTranslate, link);
        }
      }

      function handleDescription(result, selectors) {
        const description = getElemBySelector(result, selectors.description);

        duplicateNoTranslate(description, {
          preventTranslate: 'origin',
          delimiter:
            '<br>---------------------------------------------------------------------------------<br>',
          nextHandler: stylizeData
        });

        // stylizeData(description)

        function stylizeData(description) {
          const data = getElemBySelector(description, '.f');
          if (data !== null) {
            preventTranslateElem(data);
            data.style.color = 'cyan';
          }
        }
      }
    }
  }

  function getSelectors(page) {
    const SELECTORS = {
      searchPage: {
        desktop: {
          resultsContainer: '#search',
          resultsElems: '.g',
          summary: '.summary',
          links: '.yuRUbf',
          resultTitle: 'h3',
          description: '.aCOpRe'
        },
        mobile: {
          resultsContainer: '#main',
          resultsElems:
            '.ZINbbc.xpd.O9g5cc.uUPGi:not(#st-card):not(.BmP5tf):nth-last-of-type(n+1)',
          summary: '.-details',
          links: '.kCrYT',
          resultTitle: '.kCrYT',
          description: '.BNeawe.s3v9rd.AP7Wnd:not(.lRVwie)'
        }
      }
    };

    return SELECTORS[page].desktop;
  }
}

function handleGithub() {
  const href = window.location.href;
  const hostname = window.location.hostname;

  listenUrlChange(hostname);

  githubGlobal(href);
  githubSwitchHandler(href);

  function githubSwitchHandler(href) {
    if (document.querySelector('#readme')) {
      return handleMarkdownPage();
    }

    handleGithubDefault(href);
  }

  function handleMarkdownPage() {
    const notHandle = () => {
    };

    const specificHandlers = {
      handleCodeBlocks: () => {
        const context =
          document.querySelector('#readme') || document.querySelector('body');
        handleCodeBlocksGithub(context);
      },
      handle_h1: notHandle
    };

    const context = document.querySelector('#readme');
    launchTagHandlers(context, specificHandlers);
  }

  function handleGithubDefault(href) {
  }

  function handleCodeBlocksGithub(context) {
    const codeBlocks = context.querySelectorAll('pre');
    codeBlocks.forEach(handleCode);

    function handleCode(code) {
      const lines = code.querySelectorAll('span');
      lines.forEach(handleLine);

      function handleLine(line) {
        if (line.className === 'pl-c') {
          return handleCommentLine(line);
        }

        return preventTranslateElem(line);

        function handleCommentLine(commentLine) {
          const commText = commentLine.textContent || '';
          const commentStyle = {
            display: 'block;',
            color: '#148000a1'
          };

          if (commText.length > 10) {
            duplicateForNoTranslate(commentLine, commentStyle);
          }
        }

        function duplicateForNoTranslate(elem, style) {
          const clone = elem.cloneNode(true);

          if (style && style instanceof Object) {
            const styleString = Object.entries(style)
              .map(([k, v]) => `${k}:${v}`)
              .join(';');
            elem.setAttribute('style', styleString);
          }

          preventTranslateElem(clone);
          insertAfter(clone, elem);
        }
      }
    }
  }

  function githubGlobal() {
    handleLinks();

    const githubGlobalSelectorsPreventTranslate = [
      '[class="Box mb-3"]',
      'div.BorderGrid',
      'ul.pagehead-actions',
      'h1',
      'header',
      'div.bg-gray-light',
      'div.footer',
      'nav[aria-label="Repository"]',
      'div.file-navigation',
      'nav',
      'ul.filter-list',
      'button'
    ];

    githubGlobalCodeBlocksHandler();
    githubGlobalPreventTranslate(githubGlobalSelectorsPreventTranslate);

    function githubGlobalCodeBlocksHandler() {
      const code = document.querySelector('table.highlight>tbody');
      if (code) {
        handleCode(code);
      }

      function handleCode(code) {
        preventTranslateElem(code);
      }
    }

    function githubGlobalPreventTranslate(selectors) {
      selectors.forEach((selector) => {
        const elem = document.querySelector(selector);
        if (elem) {
          preventTranslateElem(elem);
        }
      });

      function handleOctotreeExtension(preventTranslateElem) {
        const octotree = document.querySelector('.octotree-sidebar');
        if (octotree) {
          preventTranslateElem(octotree);
        }
      }

      setTimeout(() => {
        handleOctotreeExtension(preventTranslateElem);
      }, 3000);
    }
  }
}

function getMainContext(extOtions, MAIN_CONTENT_SELECTORS) {
  return getByTag(MAIN_CONTENT_SELECTORS.tagsShouldBeOne) || document.body;

  function getByTag(selectors) {
    for (const selector of selectors) {
      const elements = document.querySelectorAll(`${selector}`);
      if (elements.length === 1) {
        return elements[0];
      }
    }
  }
}

function preventTitleTranslate() {
  const originTitle = document.title;
  setTimeout(setTitle.bind(null, originTitle), 5000);

  function setTitle(title) {
    document.title = title;
  }
}

function launchTagsHandlersByRules(context) {
  !detectPageLangRussian() && launchTagHandlers(context);

  function detectPageLangRussian() {
    return checkByHtmlLangAttr() || checkByTitle();

    function checkByHtmlLangAttr() {
      const language = document.querySelector('HTML').getAttribute('lang');
      if (language) {
        return language.includes('ru');
      }
    }

    function checkByTitle() {
      return testCirillic(document.title);
    }

    function testCirillic(str) {
      const cyrillicPattern = /[\u0400-\u04FF]/;
      return cyrillicPattern.test(str);
    }
  }
}

function launchTagHandlers(context, specificHandlers) {
  const handlers = {
    handle_P,
    handleCodeBlocks,
    handleCodePhrase,
    handleOtherHTags,
    handleLists,
    handleButtons,
    handleSelects,
    handleForms,
    handleDD,
    handleTR,
    handleLinks,
    ...specificHandlers
  };

  handlers.handle_P(context);
  handlers.handleCodeBlocks(context);
  handlers.handleCodePhrase(context);
  handlers.handleOtherHTags(context);
  handlers.handleButtons(context);
  handlers.handleLists(context);
  handlers.handleSelects(context);
  handlers.handleForms(context);
  handlers.handleDD(context);
  handlers.handleTR(context);
  handlers.handleLinks(context);
}

function handleOtherHTags(context) {
  const selector = 'H1, H2, H3, H4, H5, H6';
  const allHTags = getElementsBySelector(context, selector, false);
  allHTags.forEach((h) => {
    const originText = h.textContent;
    insertElementWithOriginText(originText, h);
  });
}

function handle_P(context) {
  const selector = 'P';
  const allP = getElementsBySelector(context, selector);
  const filtered = commonTagPFilter(allP);

  filtered.forEach((p) => {
    if (!skip(p)) {
      const originText = p.innerText;
      insertElementWithOriginText(originText, p);
    }
  });

  function commonTagPFilter(allP) {
    return filterByParentTagLi(allP);

    function filterByParentTagLi(elems) {
      return [...elems].filter((el) => {
        return el.parentNode.nodeName !== 'LI';
      });
    }
  }

  function skip(p) {
    return p.parentElement.getAttribute('role') === 'menu';
  }
}

function handleLists(context) {
  const allTagsLi = getElementsBySelector(context, 'LI');
  allTagsLi.forEach((li) => {
    if (!skip(li)) {
      const elemNotranslate = li.cloneNode(true);
      preventTranslateElem(elemNotranslate);
      elemNotranslate.style.color = colorTranslatedText;
      insertAfter(elemNotranslate, li);
    }
  });

  function skip(li) {
    if (li.parentElement.getAttribute('role') === 'menu') {
      return true;
    }

    return li.parentElement.parentElement.tagName === 'TD';
  }
}

function handleCodeBlocks(context) {
  const ALL_SELECTORS_CODEBLOCKS = ['pre', 'figure:not(:has(img))', '.gist', '.highlight'];
  const allCodeBlocks = getAllCodeBlocks(context, ALL_SELECTORS_CODEBLOCKS);

  allCodeBlocks.forEach((code) => {
    copyCode(code);
    preventTranslateElem(code);
  });

  function copyCode(code) {
    let copyButton = document.createElement('button');
    let buttonText = document.createTextNode('COPY');
    copyButton.className = 'copyButton';
    copyButton.appendChild(buttonText);
    copyButton.style.width = '100%';
    copyButton.style.height = '2rem';
    copyButton.style.marginTop = '1rem';
    code.appendChild(copyButton);
    copyButton.addEventListener(
      'click',
      copyTextFunc(code, copyButton, code)
    );
  }

  function getAllCodeBlocks(context, ALL_SELECTORS_CODEBLOCKS) {
    const selectors = ALL_SELECTORS_CODEBLOCKS.toString();
    return getElementsBySelector(context, selectors);
  }

  function copyTextFunc(elementToCopy, buttonToUpdate, areaToHighlight) {
    return function copyText() {
      areaToHighlight.className = 'areaToHighlight';
      elementToCopy.style.border = '1px solid #567a0d';
      setTimeout(() => {
        areaToHighlight.className = 'areaToUnHighlight';
      }, 400);
      window.copyToClipboard(elementToCopy.innerText.slice(0, -4));
      buttonToUpdate.innerText = 'COPIED';
    };
  }
}

function handleCodePhrase(context) {
  const ALL_SELECTORS_PHRASES = ['code'];
  const allPhrases = getAllPhrases(context, ALL_SELECTORS_PHRASES);

  allPhrases.forEach((element) => {
    if (element.parentElement.nodeName === 'PRE') {
      return;
    }
    if (!element.children.length) {
      if (!detectNextCharPunctuations(element)) {
        element.innerText = ' ' + element.innerText + ' ';
      }
    }

    function detectNextCharPunctuations(element) {
      const punctuations = ['.', ',', ':', '!', '?'];
      return (element?.nextSibling?.data?.charAt(0)) && (punctuations.includes(element?.nextSibling?.data?.charAt(0)));
    }

    preventTranslateElem(element);
  });

  function getAllPhrases(context, ALL_SELECTORS_PHRASES) {
    const selectors = ALL_SELECTORS_PHRASES.toString();
    return getElementsBySelector(context, selectors);
  }
}

function handleButtons(context) {
  const buttons = getElementsBySelector(context, 'button');
  buttons.forEach((btn) => {
    preventTranslateElem(btn);
  });
}

function handleSelects() {
  const selects = document.querySelectorAll('select');
  selects.forEach((sel) => {
    preventTranslateElem(sel);
  });
}

function handleForms() {
  handleInputs();
  handleForms();

  function handleInputs() {
    const inputs = document.querySelectorAll('input');
    inputs.forEach((input) => {
      preventTranslateElem(input);
    });
  }

  function handleForms() {
    handleSearchForms();

    function handleSearchForms() {
      const selector = 'form#search, form[role="search"]';
      const sfs = getElementsBySelector(document, selector);
      sfs.forEach((fs) => {
        preventTranslateElem(fs);
      });
    }
  }
}

function handleDD(context) {
  const dds = getElementsBySelector(context, 'dd');
  dds.forEach((dd) => {
    const originText = dd.textContent;
    const dd_copy = document.createElement('dd');
    dd_copy.textContent = originText;
    dd_copy.style.color = '#7b7a7b';
    preventTranslateElem(dd_copy);
    dd.parentNode.insertBefore(dd_copy, dd.nextSibling);
  });
}

function handleTR(context) {
  const trs = getElementsBySelector(context, 'tr');
  trs.forEach((tr) => {
    const tr_clone = tr.cloneNode(true);
    tr_clone.style.color = colorTranslatedText;
    preventTranslateElem(tr_clone);
    insertAfter(tr_clone, tr);
  });
}

function getElemBySelector(context = document, selector, isRequired = false) {
  const element = context.querySelector(selector);
  isDev && showBorder(element, selector);
  isDev &&
  console.log('\x1b[36m%s\x1b[0m', 'element.className = ', element.className);

  if (element === null) {
    if (isRequired === true) {
      throw new Error(`Not found element by selector: ${selector}`);
    }
    isDev && console.error(`Not found element by selector: ${selector}`);
    return null;
  }

  return element;
}

function getElementsBySelector(
  context = document,
  selector,
  isRequired = false
) {
  const elements = context.querySelectorAll(selector);
  isDev &&
  elements.forEach((element) => {
    showBorder(element, selector);
  });

  if (elements.length === 0) {
    if (isRequired === true) {
      throw new Error(`Not found elements by selector: ${selector}`);
    }
    isDev && console.error(`Not found elements by selector: ${selector}`);
    return elements;
  }

  return elements;
}

function insertElementWithOriginText(text, parent) {
  const element = getElementForDisplayOriginText(text);
  insertAfter(element, parent);
}

function insertAfter(newNode, referenceNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

function handleLinks() {
  const allLinks = document.querySelectorAll('a');
  allLinks.forEach((a) => {
    preventTranslateElem(a);
  });
}

function getElementForDisplayOriginText(text) {
  const element = document.createElement('P');
  preventTranslateElem(element);
  element.classList.add('originText');
  element.style.color = colorTranslatedText;
  element.textContent = text;

  return element;
}

function duplicateNoTranslate(elem, options) {
  if (!elem) {
    return;
  }

  const defaultOptions = {
    preventTranslate: 'origin',
    delimiter: '',
    nextHandler: () => {
    }
  };

  const innerOptions = {
    defaultOptions,
    ...options
  };

  const { preventTranslate, delimiter } = innerOptions;

  let elem_clone = elem.cloneNode(true);

  preventTranslateElem(preventTranslate === 'origin' ? elem : elem_clone);

  if (delimiter) {
    elem_clone.innerHTML = `${delimiter}${elem.innerHTML}`;
  }

  insertAfter(elem_clone, elem);
  return elem_clone;
}

function listenUrlChange(hostname) {
  chrome.runtime.onMessage.addListener(function(request, sender) {
    console.log(
      '\x1b[36m%s\x1b[0m',
      'sender = ',
      sender
    ); /* CONSOLE *************/
    handleMessage(request);
  });

  function handleMessage(message) {
    if (message.includes(hostname)) {
      window.location.reload();
    }
  }
}

!function(e) {
  if ('object' == typeof exports && 'undefined' != typeof module) module.exports = e();
  else if ('function' == typeof define && define.amd) define([], e);
  else {
    var t;
    t = 'undefined' != typeof window ? window : 'undefined' != typeof global ? global : 'undefined' != typeof self ? self : this, t.copyToClipboard = e();
  }
}(function() {
  return function e(t, n, o) {
    function r(c, i) {
      if (!n[c]) {
        if (!t[c]) {
          var l = 'function' == typeof require && require;
          if (!i && l) return l(c, !0);
          if (a) return a(c, !0);
          var u = new Error('Cannot find module \'' + c + '\'');
          throw u.code = 'MODULE_NOT_FOUND', u;
        }
        var s = n[c] = {
          exports: {}
        };
        t[c][0].call(s.exports, function(e) {
          var n = t[c][1][e];
          return r(n ? n : e);
        }, s, s.exports, e, t, n, o);
      }
      return n[c].exports;
    }

    for (var a = 'function' == typeof require && require, c = 0; c < o.length; c++) r(o[c]);
    return r;
  }({
    1: [function(e, t, n) {
      'use strict';

      function o(e) {
        var t = (/mac os x/i.test(navigator.userAgent) ? '⌘' : 'Ctrl') + '+C';
        return e.replace(/#{\s*key\s*}/g, t);
      }

      function r(e, t) {
        var n, r, i, l, u, s, f = !1;
        t || (t = {}), n = t.debug || !1;
        try {
          i = a(), l = document.createRange(), u = document.getSelection(), s = document.createElement('span'), s.textContent = e, s.style.all = 'unset', s.style.position = 'fixed', s.style.top = 0, s.style.clip = 'rect(0, 0, 0, 0)', s.style.whiteSpace = 'pre', s.style.webkitUserSelect = 'text', s.style.MozUserSelect = 'text', s.style.msUserSelect = 'text', s.style.userSelect = 'text', document.body.appendChild(s), l.selectNode(s), u.addRange(l);
          var d = document.execCommand('copy');
          if (!d) throw new Error('copy command was unsuccessful');
          f = !0;
        } catch (a) {
          n && console.error('unable to copy using execCommand: ', a), n && console.warn('trying IE specific stuff');
          try {
            window.clipboardData.setData('text', e), f = !0;
          } catch (a) {
            n && console.error('unable to copy using clipboardData: ', a), n && console.error('falling back to prompt'), r = o('message' in t ? t.message : c), window.prompt(r, e);
          }
        } finally {
          u && ('function' == typeof u.removeRange ? u.removeRange(l) : u.removeAllRanges()), s && document.body.removeChild(s), i();
        }
        return f;
      }

      var a = e('toggle-selection'),
        c = 'Copy to clipboard: #{key}, Enter';
      t.exports = r;
    }, {
      'toggle-selection': 2
    }],
    2: [function(e, t, n) {
      t.exports = function() {
        var e = document.getSelection();
        if (!e.rangeCount) return function() {
        };
        for (var t = document.activeElement, n = [], o = 0; o < e.rangeCount; o++) n.push(e.getRangeAt(o));
        switch (t.tagName.toUpperCase()) {
          case 'INPUT':
          case 'TEXTAREA':
            t.blur();
            break;
          default:
            t = null;
        }
        return e.removeAllRanges(),
          function() {
            'Caret' === e.type && e.removeAllRanges(), e.rangeCount || n.forEach(function(t) {
              e.addRange(t);
            }), t && t.focus();
          };
      };
    }, {}]
  }, {}, [1])(1);
});

// ==UserScript==
// @name         linux.do reply helper
// @name:ja      linux.do reply helper
// @name:en      linux.do reply helper
// @namespace    http://tampermonkey.net/
// @version      2024-02-10
// @description  自動載入reply、省略已經載入的reply、隱藏新用戶提示
// @description:ja  自動でreplyをロードし、ロード済みのreplyを省略し、新規ユーザーのヒントを非表示にします
// @description:en  Automatically load reply, omit loaded reply, and hide new user tips
// @author       Bee10301
// @match        https://linux.do/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=linux.do
// @grant        none
// @license      GNU GPLv3
// ==/UserScript==

(async function () {
  "use strict";
  while (!document.querySelector(".topic-post")) {
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  // show replies
  for (let i = 0; i < document.querySelectorAll(".show-replies").length; i++) {
    document.querySelectorAll(".show-replies")[i].click();
  }
  // new user
  for (let i = 0; i < document.querySelectorAll(".new-user").length; i++) {
    document.querySelectorAll(".new-user")[i].style.display = "none";
  }

  // handle new posts auto load
  function handleIntersect(entries, observer) {
    for (let entry of entries) {
      if (entry.isIntersecting) {
        // load replies
        let btn = entry.target.querySelector(".show-replies");
        if (btn && btn.getAttribute("aria-expanded") === "false") {
          btn.click();
        }
        // hide new user tips
        let newUser = entry.target.querySelector(".new-user");
        if (newUser) {
          newUser.style.display = "none";
        }
      }
    }
  }

  // settings threshold
  let options = {
    root: null,
    rootMargin: "0px",
    threshold: 0.1,
  };

  let observer = new IntersectionObserver(handleIntersect, options);

  // handle new posts
  function observeNewPosts(mutations) {
    for (let mutation of mutations) {
      for (let addedNode of mutation.addedNodes) {
        // if have new post
        if (
          addedNode.nodeType === 1 &&
          addedNode.classList.contains("topic-post")
        ) {
          // reply post without reply
          let replyTab = addedNode.querySelector(".reply-to-tab");
          let replyBtn = addedNode.querySelector(".show-replies");
          if (replyTab && !replyBtn) {
            addedNode.style.display = "none";
          } else {
            // load replies
            observer.observe(addedNode);
          }
        }
      }
    }
  }

  // checck DOM
  let mutationObserver = new MutationObserver(observeNewPosts);

  // Mutation Observer check node change
  mutationObserver.observe(document.querySelector(".post-stream"), {
    childList: true, // check child node
    subtree: true, // check all child node
  });
})();

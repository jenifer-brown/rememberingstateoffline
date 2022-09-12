import { registerSW } from "virtual:pwa-register";

// Register the service worker
if ("serviceWorker" in navigator) {
  // Wait for the 'load' event to not block other work
  window.addEventListener("load", async () => {
    // Try to register the service worker.
    try {
      const reg = await navigator.serviceWorker.register(swURL);
      console.log("Service worker registered! 😎", reg);
    } catch (err) {
      console.log("😥 Service worker registration failed: ", err);
    }
  });
}

const updateSW = registerSW({
  onNeedRefresh() {},
  onOfflineReady() {},
});

class MyCommentComponent extends HTMLElement {
  constructor() {
    super();
    let displayedComments = new Array();
    let filterLong = false;
    let filterShort = false;
    let isFiltered = false;

    let DB_NAME = "commentDB";
    let db = indexedDB;
    const dbRequest = db.open(DB_NAME, 1);
    dbRequest.onupgradeneeded = (event) => {
      const db = event.target.result;
      let comments = db.createObjectStore("comments", {
        keyPath: "userName_Date",
      });
      comments.createIndex("userName", "userName", { unique: false });
      comments.createIndex("email", "email", { unique: false });
      comments.createIndex("date", "date", { unique: false });
      comments.createIndex("length", "length", { unique: false });
      comments.createIndex("comment", "comment", { unique: true });
    };

    dbRequest.onerror = (event) => {
      // Generic error handler for all errors targeted at this database's
      // requests!
      console.error(`Database error: ${event.target.errorCode}`);
    };

    const shadow = this.attachShadow({ mode: "open" });

    // holds the comment component
    let container = document.createElement("div");
    container.setAttribute("class", "container");

    // place for user input
    let inputForm = document.createElement("form");
    inputForm.setAttribute("class", "inputForm");

    // where user comments are stored
    let commentList = document.createElement("div");
    commentList.style.border = "1px dashed black";
    commentList.style.margin = "10px 0px 10px 0px";
    commentList.style.padding = "0px 10px 0px 10px";

    function loadAllComments() {
      const request = indexedDB.open(DB_NAME, 1);
      request.onerror = (event) => {
        console.log("Error " + event.target.error);
      };

      request.onupgradeneeded = (event) => {
        console.log("upgrademe");
      };

      request.onsuccess = (event) => {
        let db = event.target.result;
        let dbTrans = db.transaction("comments").objectStore("comments");

        dbTrans.transaction.oncomplete = (event) => {
          console.log("add complete" + event.target);
        };
        dbTrans.transaction.onerror = (event) => {
          console.log("add failed " + event.target.error);
        };

        dbTrans.openCursor().onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            let newComment = new MyComment();
            newComment.setUserName(cursor.value.userName);
            newComment.setEmail(cursor.value.email);
            newComment.setDate(cursor.value.date);
            newComment.setComment(cursor.value.comment);
            newComment.setId(cursor.value.userName_Date);

            // add all comments to the current state
            displayedComments.push(newComment);
            commentList.appendChild(newComment.getMyComment());
            commentList.appendChild(createDeleteButton(newComment));
            console.log("added comment to state");

            cursor.continue();
          } else {
            console.log("no more entries");
          }
        };
      };
    }

    loadAllComments();
    // adds new comments to the comment list
    function addComment() {
      // create comment
      let currDate = new Date();
      let mycomment = new MyComment();

      let userName = inputForm.elements[0].value;
      let email = inputForm.elements[1].value;
      let commentText = inputForm.elements[2].value;
      let id = userName + currDate.toString();

      mycomment.setUserName(userName);
      mycomment.setEmail(email);
      mycomment.setDate(currDate);
      mycomment.setComment(commentText);
      mycomment.setId(id);

      // add comment to state variable array
      displayedComments.push(mycomment);

      commentList.appendChild(mycomment.getMyComment());

      const request = indexedDB.open(DB_NAME, 1);
      request.onerror = (event) => {
        console.log("Error " + event.target.error);
      };

      request.onupgradeneeded = (event) => {
        console.log("upgrademe");
      };

      request.onsuccess = (event) => {
        let db = event.target.result;

        console.log("event.target.results ", db);
        let dbTrans = db
          .transaction("comments", "readwrite")
          .objectStore("comments");

        const item = [
          {
            userName: userName,
            email: email,
            date: currDate,
            length: commentText.length,
            userName_Date: id,
            comment: commentText,
          },
        ];

        const resultst = dbTrans.add(item[0]);
        resultst.onsuccess = (e) => {
          console.log("add succs");
        };
        resultst.onerror = (e) => {
          console.log("add error " + e.target.error);
        };
      };

      commentList.appendChild(createDeleteButton(mycomment));
      location.reload();
      inputForm.reset();
    }

    function filterComments() {
      if (!isFiltered) return;
      console.log("start filtering");
      // remove all comments
      while (commentList.firstChild) {
        commentList.removeChild(commentList.firstChild);
      }

      // add correct comments
      displayedComments.forEach((elem, index, arr) => {
        if (filterLong && elem.getComment().length >= 100) {
          commentList.appendChild(elem.getMyComment());
          commentList.appendChild(createDeleteButton(elem));
          console.log("added comment to state");
        } else if (filterShort && elem.getComment().length < 100) {
          commentList.appendChild(elem.getMyComment());
          commentList.appendChild(createDeleteButton(elem));
          console.log("added comment to state");
        }
      });
    }

    function createDeleteButton(comment) {
      // create delete button
      let deleteButton = document.createElement("button");
      deleteButton.setAttribute("type", "button");
      deleteButton.innerText = "Delete Comment";
      let id = comment.getId();

      deleteButton.addEventListener("click", () => {
        let toDelete = document.getElementById(id);

        // delete in HTML
        while (toDelete) {
          toDelete.remove();
          toDelete = document.getElementById(id);
        }

        // delete from state variable arr
        deleteStateComment(`${id}`);

        // delete from database
        const request = indexedDB.open(DB_NAME, 1);

        request.onerror = (event) => {
          console.log("Error " + event.target.error);
        };

        request.onsuccess = (event) => {
          let db = event.target.result;
          db.transaction("comments", "readwrite")
            .objectStore("comments")
            .delete(id);
          console.log("deleted");
        };

        location.reload();
      });
      return deleteButton;
    }

    // delete comment from state variable
    function deleteStateComment(id) {
      displayedComments.forEach((comment, index, arr) => {
        if (comment.getId() === id) {
          arr[index] = "";
        }
      });
    }

    // add submit event listener
    inputForm.addEventListener("submit", (e) => {
      e.preventDefault();
      addComment();
    });

    // create comment length filter button
    let filterOptions = [
      { text: "No filter", value: "0" },
      { text: "Show short comments only", value: "1" },
      { text: "Show long comments only", value: "2" },
    ];
    let filterSelect = document.createElement("select");
    filterSelect.id = "filterSelect";

    filterOptions.forEach((elem) => {
      let option = document.createElement("option");
      option.value = elem.value;
      option.text = elem.text;
      filterSelect.appendChild(option);
    });

    let lengthFilterButton = document.createElement("button");
    lengthFilterButton.setAttribute("type", "button");
    lengthFilterButton.innerText = "Filter";
    lengthFilterButton.addEventListener("click", (e) => {
      let options = filterSelect.querySelectorAll("option");
      let toFilter;
      options.forEach((elem) => {
        if (elem.selected) {
          toFilter = elem.value;
        }
      });
      console.log(toFilter + " " + isFiltered);
      switch (toFilter) {
        case "0":
          isFiltered = false;
          filterLong = false;
          filterShort = false;
          break;
        case "1":
          isFiltered = true;
          filterLong = false;
          filterShort = true;
          break;
        case "2":
          isFiltered = true;
          filterLong = true;
          filterShort = false;
          break;
      }
      console.log(toFilter + " " + isFiltered);
      filterComments();
      console.log("filter these comments");
    });

    // create name input and label for form
    let userName = document.createElement("input");
    userName.setAttribute("class", "username");
    userName.setAttribute("id", "username");
    userName.setAttribute("type", "text");
    userName.required = true;

    let nameLabel = document.createElement("label");
    nameLabel.setAttribute("for", "username");
    nameLabel.innerText = "Enter Username (Required):  ";

    let nameDiv = document.createElement("div");
    nameDiv.setAttribute("id", "nameDiv");
    nameLabel.appendChild(userName);
    nameDiv.appendChild(nameLabel);

    // create email input
    let email = document.createElement("input");
    email.setAttribute("class", "email");
    email.setAttribute("id", "email");
    email.setAttribute("type", "email");
    email.required = true;

    let emailLabel = document.createElement("label");
    emailLabel.setAttribute("for", "email");
    emailLabel.innerText = "Enter Email (Required):  ";

    let emailDiv = document.createElement("div");
    emailDiv.setAttribute("id", "emailDiv");
    emailLabel.appendChild(email);
    emailDiv.appendChild(emailLabel);

    // create comment input
    let commentText = document.createElement("textarea");
    commentText.setAttribute("id", "commenttext");
    commentText.setAttribute("class", "commenttext");
    commentText.setAttribute("rows", "20");
    commentText.setAttribute("cols", "50");
    commentText.required = true;

    let commentLabel = document.createElement("label");
    commentLabel.setAttribute("for", "commenttext");
    commentLabel.innerText = "Type Your Comment: \n";

    let commentDiv = document.createElement("div");
    commentDiv.setAttribute("id", "commentDiv");
    commentLabel.appendChild(commentText);
    commentDiv.appendChild(commentLabel);

    // checkbox for permission
    let permissionBox = document.createElement("input");
    permissionBox.setAttribute("id", "permissionbox");
    permissionBox.setAttribute("class", "permissionbox");
    permissionBox.setAttribute("type", "checkbox");
    permissionBox.required = true;

    let permissionLabel = document.createElement("label");
    permissionLabel.setAttribute("for", "permissionbox");
    permissionLabel.innerText = "Check box to agree to have comment posted  ";

    let permissionDiv = document.createElement("div");
    permissionDiv.setAttribute("id", "permissionDiv");
    permissionLabel.appendChild(permissionBox);
    permissionDiv.appendChild(permissionLabel);

    // create post button
    let postButton = document.createElement("button");
    postButton.setAttribute("type", "submit");
    postButton.innerText = "Post Comment";

    // add label and input elements to the form
    inputForm.appendChild(nameDiv);
    inputForm.appendChild(emailDiv);
    inputForm.appendChild(commentDiv);
    inputForm.appendChild(permissionDiv);
    inputForm.appendChild(filterSelect);
    inputForm.appendChild(lengthFilterButton);
    inputForm.appendChild(document.createElement("br"));
    inputForm.appendChild(postButton);

    // add form to container
    container.appendChild(commentList);
    container.appendChild(inputForm);

    // add container to body
    shadow.appendChild(container);
  }
}

class MyComment extends HTMLElement {
  constructor() {
    super();
    this.userName = "";
    this.email = "";
    this.date = undefined;
    this.comment = "";
    this.id = "";
  }

  setId(id) {
    this.id = id;
  }

  getId() {
    return this.id;
  }

  setUserName(userName) {
    this.userName = userName;
  }

  getUserName() {
    return this.userName;
  }

  getEmail() {
    return this.email;
  }

  getDate() {
    return this.date;
  }

  getComment() {
    return this.comment;
  }

  setEmail(email) {
    this.email = email;
  }

  setDate(date) {
    this.date = date;
  }

  setComment(comment) {
    this.comment = comment;
  }

  getMyComment() {
    // create comment paragraph and label for comment
    let fullComment = document.createElement("div");
    fullComment.setAttribute("id", `${this.id}`);
    let postedComment = document.createElement("p");
    postedComment.setAttribute("id", `${this.id}`);

    let postedLabel = document.createElement("h2");
    postedLabel.setAttribute("id", `${this.id}`);

    // add text to comment elements
    postedLabel.innerText = `Comment from ${this.userName} (${this.email}, at ${this.date})`;
    postedComment.innerText = `${this.comment}`;

    fullComment.appendChild(postedLabel);
    fullComment.appendChild(postedComment);

    return fullComment;
  }
}

// Define the new element
customElements.define("my-comment", MyComment);

// Define the new element
customElements.define("my-comment-component", MyCommentComponent);

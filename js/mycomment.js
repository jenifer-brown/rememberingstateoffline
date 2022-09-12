export class MyComment extends HTMLElement {
  constructor() {
    super();
    this.userName = "";
    this.email = "";
    this.date = undefined;
    this.comment = "";
  }

  setUserName(userName) {
    this.userName = userName;
  }

  setEmail(email) {
    this.email = email;
  }

  setDate(date) {
    this.Date = date;
  }

  setComment(comment) {
    this.comment = comment;
  }

  getMyComment() {
    // create comment paragraph and label for comment
    let postedComment = document.createElement("p");
    postedComment.setAttribute(
      "id",
      `postedComment-${this.email}` + "-" + this.date
    );

    let postedLabel = document.createElement("h2");
    postedLabel.setAttribute(
      "id",
      `postedLabel-${this.email}` + "-" + this.date
    );

    // add text to comment elements
    postedLabel.innerText = `Comment from ${this.userName} (${this.email}, at ${this.date})`;
    postedComment.innerText = `${comment}`;

    return postedComment;
  }
}

// Define the new element
customElements.define("my-comment", MyComment);

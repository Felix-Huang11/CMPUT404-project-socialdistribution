import axios from "axios";
import { domain, port } from "./URL";

export function authAuthor(params = {}) {
  const URL = `${domain}:${port}/token-auth/`;
  const requestBody = {
    username: params.username,
    password: params.password,
  };

  return axios
    .post(URL, requestBody, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `JWT ${localStorage.getItem("token")}`,
      },
    })
    .then((response) => {
      return response;
    })
    .catch((error) => {
      return error.response;
    });
}

export function getAuthorByUsername(params = {}) {
  const URL = `${domain}:${port}/user-author/`;
  const requestBody = {
    username: params.username,
  };

  return axios
    .post(URL, requestBody, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `JWT ${localStorage.getItem("token")}`,
      },
    })
    .then((response) => {
      return response;
    })
    .catch((error) => {
      return error.response;
    });
}

export function getAuthorByAuthorID(params = {}) {
  const URL = params.authorID;
  return axios
    .get(URL, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `JWT ${localStorage.getItem("token")}`,
      },
    })
    .then((response) => {
      return response;
    })
    .catch((error) => {
      return error.response;
    });
}

export function getUsermod(params = {}) {
  const URL = `${domain}:${port}/usermod/${params.username}/`;

  return axios
    .get(URL, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      return response;
    })
    .catch((error) => {
      return error.response;
    });
}

export function postAuthor(params = {}) {
  const URL = `${domain}:${port}/author/`;
  const requestBody = {
    displayName: params.displayName,
    github: params.github,
    username: params.username,
    email: params.email,
    password: params.password,
  };

  return axios
    .post(URL, requestBody, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      return response;
    })
    .catch((error) => {
      return error.response;
    });
}

export function updateAuthor(params = {}) {
  const URL = params.authorID + "/";
  const requestBody = {
    displayName: params.displayName,
    github: params.github,
  };

  return axios
    .put(URL, requestBody, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `JWT ${localStorage.getItem("token")}`,
      },
    })
    .then((response) => {
      return response;
    })
    .catch((error) => {
      return error.response;
    });
}

export function getAllAuthors(params = {}) {
  const URL = `${domain}:${port}/all-authors/`;

  return axios
    .get(URL, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `JWT ${localStorage.getItem("token")}`,
      },
    })
    .then((response) => {
      return response;
    })
    .catch((error) => {
      return error.response;
    });
}

// Remote
export function getRemoteAuthorByAuthorID(params = {}) {
  return axios
    .get(params.URL, {
      headers: {
        "Content-Type": "application/json",
        Authorization: params.auth,
      },
    })
    .then((response) => {
      return response;
    })
    .catch((error) => {
      return error.response;
    });
}

export function authRemoteAuthor(params = {}) {
  // URL = `${remoteDomain}/token-auth/`;
  const requestBody = {
    username: params.username,
    password: params.password,
  };
  return axios
    .post(params.URL, requestBody, {
      headers: {
        "Content-Type": "application/json",
        Authorization: params.auth, //`JWT ${localStorage.getItem("token")}`,
      },
    })
    .then((response) => {
      return response;
    })
    .catch((error) => {
      return error.response;
    });
}

export function getRemoteAuthor(params = {}) {
  return axios
    .get(params.URL, {
      headers: {
        "Content-Type": "application/json",
        Authorization: params.auth,
      },
    })
    .then((response) => {
      return response;
    })
    .catch((error) => {
      return error.response;
    });
}

export function getRemoteUsermod(params = {}) {
  // const URL = `${domain}:${port}/usermod/${params.username}/`;
  return axios
    .get(params.URL, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      return response;
    })
    .catch((error) => {
      return error.response;
    });
}

export function postRemoteAuthor(params = {}) {
  const requestBody = {
    displayName: params.displayName,
    github: params.github,
    username: params.username,
    email: params.email,
    password: params.password,
  };
  return axios
    .post(params.URL, requestBody, {
      headers: {
        "Content-Type": "application/json",
        Authorization: params.auth,
      },
    })
    .then((response) => {
      return response;
    })
    .catch((error) => {
      return error.response;
    });
}

export function getAllRemoteAuthors(params = {}) {
  return axios
    .get(params.URL, {
      headers: {
        "Content-Type": "application/json",
        Authorization: params.auth,
      },
    })
    .then((response) => {
      return response;
    })
    .catch((error) => {
      return error.response;
    });
}

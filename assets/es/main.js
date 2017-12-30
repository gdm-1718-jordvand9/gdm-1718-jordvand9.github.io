'use strict';
'use strict';

import { AJAX } from './utils';

class App {
  constructor () {
    console.log('Constructor of the class');
  }

  init () {
    console.log('Initialization of the class App');
  }
};
window.addEventListener('load', (ev) => {
  const app = new App();
  app.init();
  // Navigation
  const navigationOpenElement = document.querySelector('.navigation__open');
  const navigationCloseElement = document.querySelector('.header__overlay--close');
  const navigationOverlayElement = document.querySelector('.header__overlay');
  navigationOpenElement.addEventListener('click', e => {
    e.preventDefault();
    navigationOverlayElement.style.width = '100%';
  });
  navigationCloseElement.addEventListener('click', e => {
    e.preventDefault();
    navigationOverlayElement.style.width = '0%';
  });
});

(function () {
  // Initialize Firebase
  let config = {
    apiKey: 'AIzaSyBtJfXrRjFaGhUJtEoXlmaVPUkZuM-zYqY',
    authDomain: 'mobdev-1.firebaseapp.com',
    databaseURL: 'https://mobdev-1.firebaseio.com',
    projectId: 'mobdev-1',
    storageBucket: 'mobdev-1.appspot.com',
    messagingSenderId: '378790549314'
  };
  firebase.initializeApp(config);
})();

// Quick acces to firebase elements
const _database = firebase.database();
const _auth = firebase.auth();
const _storage = firebase.storage();
const firebaseRefs = [];
var _loggedIn, _currentUser;

function currentPage () {
  const pathName = window.location.pathname;
  console.log(pathName);
  switch (pathName) {
    case '/detail/':
      console.log('Executing code for detail page ...');
      generateDetailTemplate();
      break;
    case '/blog/':
      console.log('Executing code for blog page ...');
      generateBlogTemplate();
      break;
    case '/project/':
      console.log('Executing code for project page ...');
      generateProjectTemplate();
      break;
    case '/login/':
      console.log('Executing code for login page ...');
      Login();
      break;
    case '/register/':
      console.log('Executing code for register page ...');
      Register();
      break;
    case '/controlpanel/':
      console.log('Executing code for controlpanel page ...');
      generateControlPanelTemlate();
      break;
    case '/department/':
      console.log('Executing code for department page ...');
      generateDepartmenTemplate();
      break;
    case '/article/':
      console.log('Executing code for article page ...');
      generateArticleTemplate();
      break;
    case '/account/':
      console.log('Executing code for account page ...');
      generateAccountTemplate();
      break;
    case '/specialization/':
      console.log('Executing code for specialization page ...');
      generateSpecializationTemplate();
      break;
    case '/feed/':
      console.log('Executing code for feed page ...');
      generateFeedTemplate();
      break;
    default:
      console.log('Executing code for default page ...');
  }
}
// Check current page and assign the right function

CheckAuthChange();
function CheckAuthChange () {
  _auth.onAuthStateChanged(firebaseUser => {
    const loginStateElement = document.getElementById('authElement');
    const loginStateElementNav = document.getElementById('authElementNav');
    if (firebaseUser) {
      console.log('Logged in user : ' + firebaseUser.displayName);
      // Show logout-element
      createLoginStateElement(true, loginStateElement);
      createLoginStateElement(true, loginStateElementNav);
      _loggedIn = true;
      _currentUser = firebaseUser;
    } else {
      console.log('Niemand aanwezig');
      // Hide logout-element
      createLoginStateElement(false, loginStateElement);
      createLoginStateElement(false, loginStateElementNav);
      _loggedIn = false;
    }
    currentPage();
  });
}

function generateProjectTemplate () {
  AJAX.loadTextByPromise('../templates/project.hbs').then(
    (data) => {
      const projectsRef = _database.ref('projects').orderByChild('visible').equalTo(true);
      const departmentsRef = _database.ref('departments').orderByChild('visible').equalTo(true);
      const container = document.querySelector('.projectContainer');
      const departmentsArray = [];
      projectsRef.on('value', (snap) => {
        const obj = snap.val();
        snap.forEach((snapChild) => {
          const date = new Date(snapChild.val().createdDate);
          obj[snapChild.key].formattedDate = date.getDate() + '-' + (date.getMonth() + 1 + '-') + date.getFullYear().toString().substr(-2);
        });
        renderTemplate(data, obj, container);
      });
      departmentsRef.on('value', (snap) => {
        departmentsArray.length = 0;
        snap.forEach((snapChild) => {
          const opt = document.createElement('option');
          opt.value = snapChild.key;
          opt.innerHTML = snapChild.val().name;
          departmentsArray.push(opt);
        });
        departmentsArray.forEach(e => {
          txtProjectDepartment.appendChild(e);
        });
      });
    });
  const optionsArr = [];
  const txtProjectTitle = document.getElementById('projectTitle');
  const txtProjectBody = document.getElementById('projectBody');
  const txtProjectSynopsis = document.getElementById('projectSynopsis');
  const txtProjectDepartment = document.getElementById('projectDepartment');
  const txtProjectTags = document.getElementById('projectTags');
  const btnCreateProject = document.getElementById('btnProjectCreate');
  const txtProjectSpecialization = document.getElementById('projectSpecialization');
  txtProjectDepartment.addEventListener('change', e => {
    optionsArr.length = 0;
    txtProjectSpecialization.innerHTML = '';
    const departmentId = txtProjectDepartment.value;
    console.log(departmentId);
    const ref = _database.ref('departments/' + departmentId + '/specializations').orderByChild('visible').equalTo(true);
    ref.once('value', snap => {
      snap.forEach(e => {
        const opt = document.createElement('option');
        opt.value = e.key;
        opt.innerHTML = e.val().name;
        optionsArr.push(opt);
      });
      optionsArr.forEach(e => {
        txtProjectSpecialization.appendChild(e);
      });
    });
  });
  btnCreateProject.addEventListener('click', e => {
    e.preventDefault();
    const btnUploadFiles = document.getElementById('btnUploadFile').files;
    if (_loggedIn === true) {
      CreateProject(txtProjectTitle.value, txtProjectBody.value, btnUploadFiles, txtProjectSynopsis.value, txtProjectDepartment.value, txtProjectTags.value, txtProjectSpecialization.value);
    } else {
      window.location = '/login';
    }
  });
}

function generateFeedTemplate () {
  AJAX.loadTextByPromise('../templates/feed.hbs').then(
    (data) => {
      console.log('feed');
      const container = document.querySelector('.feedContainer');
      const array = [];
      if (_loggedIn === true) {
        const feedRef = _database.ref('users/' + _currentUser.uid + '/following');
        feedRef.on('child_added', (snap) => {
          const postRef = _database.ref('user-projects/' + snap.key).orderByChild('visible').equalTo(true);
          console.log(snap.val());
          postRef.on('child_added', (snapChild) => {
            console.log(snapChild.val());
            const obj = snapChild.val();
            obj.id = snapChild.key;
            array.push(obj);
            console.log(array);
            renderTemplate(data, array, container);
          });
        });
      } else {
        window.location = '/login';
      }
    });
}

function generateDetailTemplate () {
  const id = window.location.search.substr(1);
  AJAX.loadTextByPromise('../templates/detail.hbs').then(
    (data) => {
      const ref = _database.ref('projects/' + id);
      const commentRef = _database.ref('project-comments/' + id).orderByChild('visible').equalTo(true);
      const projectLikesRef = _database.ref('project-likes');
      const container = document.querySelector('.detailContainer');
      var obj, detailObj, projectLikesObj, commentsObj;
      ref.on('value', (snap) => {
        detailObj = snap.val();
        if (_loggedIn === true) {
          projectLikesRef.once('value', (snap) => {
            if (snap.child(_currentUser.uid).hasChild(id)) {
              detailObj.userLiked = true;
            } else {
              detailObj.userLiked = false;
            }
          });
        }
        const departmentsRef = _database.ref('departments/' + snap.val().departmentId);
        departmentsRef.once('value', snapChild => {
          detailObj.departmentName = snapChild.val().name;
          console.log(detailObj.departmentName);
          renderTemplate();
        });
        const specializationRef = departmentsRef.child('specializations/' + snap.val().specializationId);
        specializationRef.once('value', snapChild => {
          detailObj.specializationName = snapChild.val().name;
        });
        detailObj.favoriteCountString = favoriteString(snap.val().favoriteCount);
        obj = { detail: detailObj, comments: commentsObj, likes: projectLikesObj };
        renderTemplate();
      });
      commentRef.on('value', (snap) => {
        commentsObj = snap.val();
        snap.forEach(snapChild => {
          commentsObj[snapChild.key].formattedDate = dateString(snapChild.val().createdDate);
          commentsObj[snapChild.key].timeAgo = timeAgo(snapChild.val().createdDate);
          if (_loggedIn === true) {
            if (_currentUser.uid === snapChild.val().uid) {
              commentsObj[snapChild.key].currentUserComment = true;
            } else {
              commentsObj[snapChild.key].currentUserComment = false;
            }
          }
        });
        obj = { detail: detailObj, comments: commentsObj, likes: projectLikesObj };
        renderTemplate();
      });
      function renderTemplate () {
        console.log(obj);
        obj.detail.favoriteCountString = favoriteString(detailObj.favoriteCount);
        const template = Handlebars.compile(data);
        const html = template(obj);
        container.innerHTML = html;
        const btnFavorite = document.getElementById('btnToggleFavorite');
        const btnCommentDelete = document.querySelectorAll('.btnCommentDelete');
        btnFavorite.addEventListener('click', e => {
          e.preventDefault();
          if (_loggedIn === true) {
            AddToFavorite(obj.detail.uid, id);
          } else {
            window.location = '/login';
          }
        });
        // get image id
        const images = document.querySelectorAll('.detail-image');
        Array.from(images).forEach(img => {
          img.addEventListener('click', e => {
            const imgId = img.dataset.id;
            const popup = document.querySelector(`div[data-id="popup-${imgId}"]`);
            const popupImage = document.getElementById(imgId);
            popup.style.display = 'block';
            popupImage.src = imgId;
            const closePopup = document.querySelector(`span[data-id="close-${imgId}"]`);
            console.log(closePopup);
            closePopup.addEventListener('click', e => {
              popup.style.display = 'none';
            });
          });
        });
        Array.from(btnCommentDelete).forEach(btn => {
          btn.addEventListener('click', e => {
            e.preventDefault();
            const commentId = btn.dataset.id;
            const ref = _database.ref('project-comments/' + id + '/' + commentId);
            softDelete(ref, false);
          });
        });
      }
    });
  const btnPostComment = document.getElementById('btnPostComment');
  const txtComment = document.getElementById('comment');
  btnPostComment.addEventListener('click', e => {
    e.preventDefault();
    CreateComment(txtComment.value);
    txtComment.value = '';
  });
}

function generateAccountTemplate () {
  AJAX.loadTextByPromise('../templates/account.hbs').then(
    (data) => {
      const id = window.location.search.substr(1);
      const ref = _database.ref('users/' + id);
      const projectRef = _database.ref('user-projects/' + id);
      const container = document.querySelector('.accountContainer');
      var obj, userObj, projectObj;
      ref.on('value', (snap) => {
        userObj = snap.val();
        userObj.timeAgo = timeAgo(userObj.createdDate);
        if (_loggedIn === true) {
          if (snap.child('followers').hasChild(_currentUser.uid)) {
            userObj.isFollowing = true;
          }
        }
        obj = { user: userObj, projects: projectObj };
        renderTemplate();
      });
      projectRef.on('value', (snap) => {
        projectObj = snap.val();
        console.log(snap.val());
        snap.forEach((snapChild) => {
          projectObj[snapChild.key].formattedDate = shortDateString(snapChild.val().createdDate);
        });
        obj = { user: userObj, projects: projectObj };
        renderTemplate();
      });
      function renderTemplate () {
        console.log(obj);
        const template = Handlebars.compile(data);
        const html = template(obj);
        container.innerHTML = html;
        const btnFollow = document.getElementById('btnFollow');
        btnFollow.addEventListener('click', e => {
          e.preventDefault();
          followUser(id);
        });
      }
    });
}

function generateDepartmenTemplate () {
  AJAX.loadTextByPromise('../templates/department.hbs').then(
    (data) => {
      const ref = _database.ref('departments').orderByChild('visible').equalTo(true);
      const container = document.querySelector('.departmentContainer');
      ref.on('value', (snap) => {
        const template = Handlebars.compile(data);
        const html = template(snap.val());
        container.innerHTML = html;
      });
    });
}

function generateArticleTemplate () {
  const id = window.location.search.substr(1).split('&');
  let departmentId = id[0];

  var departmentName;
  let articleId = id[1];
  const containerElement = document.querySelector('.articleContainer');
  const ref = _database.ref('blog/' + departmentId + '/' + articleId);
  const departmentRef = _database.ref('departments/' + departmentId);
  AJAX.loadTextByPromise(`../templates/article.hbs`).then(
    (data) => {
      departmentRef.once('value', (snap) => {
        departmentName = snap.val().name;
      }).then(e => {

      }).catch(e => {
        console.log(e.message);
      });
      ref.once('value', (snap) => {
        const template = Handlebars.compile(data);
        const Array = { article: snap.val(), departmentName: departmentName };
        console.log(Array);
        const html = template(Array);
        containerElement.innerHTML = html;
      });
    });
}

function generateBlogTemplate () {
  AJAX.loadTextByPromise('../templates/blog.hbs').then(
    (data) => {
      const id = window.location.search.substr(1);
      const ref = _database.ref('blog/' + id);
      const departmentRef = _database.ref('departments/' + id);
      const container = document.querySelector('.blogContainer');
      var departmentName, departmentId;
      departmentRef.once('value', (snap) => {
        departmentName = snap.val().name;
        departmentId = snap.key;
      }).then(e => {

      }).catch(e => {
        console.log(e.message);
      });
      ref.on('value', (snap) => {
        // Create an object with all of the articles and the necessary deparment information.
        const obj = { articles: snap.val(), departmentName: departmentName, departmentId: departmentId };
        console.log(obj);
        const template = Handlebars.compile(data);
        const html = template(obj);
        container.innerHTML = html;
      });
    });
}

function generateControlPanelTemlate () {
  AJAX.loadTextByPromise('../templates/controlpanel.hbs').then(
    (data) => {
      const departmentRef = _database.ref('departments');
      const blogRef = _database.ref('blog');
      const projectRef = _database.ref('projects');
      const container = document.querySelector('.controlPanelContainer');
      var blogObj, departmentObj, projectObj;
      const departmentArr = [];
      var obj;
      function compileTemplate () {
        const template = Handlebars.compile(data);
        const html = template(obj);
        container.innerHTML = html;
        // Department DOM
        const txtDepartementName = document.getElementById('departmentName');
        const txtDepartementFacebookUri = document.getElementById('departmentFacebookUri');
        const txtDepartementInstagramUri = document.getElementById('departmentInstagramUri');
        const txtDepartmentAddress = document.getElementById('departmentAddress');
        const txtDepartementTwitterUri = document.getElementById('departmentTwitterUri');
        const txtDepartmentDescription = document.getElementById('departmentDescription');
        const btnDepartmentCreate = document.getElementById('btnCreateDepartment');
        btnDepartmentCreate.addEventListener('click', e => {
          e.preventDefault();
          createDepartment(txtDepartementName.value, txtDepartmentAddress.value, txtDepartmentDescription.value, txtDepartementFacebookUri.value, txtDepartementTwitterUri.value, txtDepartementInstagramUri.value);
        });
        // Specialization DOM
        const txtSpecializationName = document.getElementById('specializationName');
        const txtSpecializationDescription = document.getElementById('specializationDescription');
        const txtSpecializationDepartment = document.getElementById('specializationDepartment');
        const btnSpecializationCreate = document.getElementById('btnCreateSpecialization');
        const btnSpecializationSoftDelete = document.querySelectorAll('.btnSpecializationSoftDelete');
        const btnSpecializationHardDelete = document.querySelectorAll('.btnSpecializationHardDelete');
        btnSpecializationCreate.addEventListener('click', e => {
          e.preventDefault();
          createSpecialization(txtSpecializationName.value, txtSpecializationDescription.value, txtSpecializationDepartment.value);
        });
        // Blog DOM
        const txtBlogTitle = document.getElementById('articleTitle');
        const txtBlogDepartment = document.getElementById('articleDepartment');
        const txtBlogBody = document.getElementById('articleBody');
        const txtBlogTags = document.getElementById('articleTags');
        const btnBlogCreate = document.getElementById('btnCreateArticle');
        const btnDepartmentSoftDelete = document.querySelectorAll('.btnSoftDeleteDepartment');
        const btnArticleSoftDelete = document.querySelectorAll('.btnSoftDeleteArticle');
        const btnProjectSoftDelete = document.querySelectorAll('.btnProjectSoftDelete');
        const btnProjectHardDelete = document.querySelectorAll('.btnProjectHardDelete');
        const btnDepartmentHardDelete = document.querySelectorAll('.btnDepartmentHardDelete');
        const btnArticleHardDelete = document.querySelectorAll('.btnArticleHardDelete');
        console.log(txtBlogDepartment);
        console.log(txtSpecializationDepartment);
        departmentArr.forEach(e => {
          console.log(departmentArr);
          txtSpecializationDepartment.appendChild(e);
          var e2 = e.cloneNode(true);
          txtBlogDepartment.appendChild(e2);
        });
        btnBlogCreate.addEventListener('click', e => {
          e.preventDefault();
          createArticle(txtBlogTitle.value, txtBlogBody.value, txtBlogDepartment.value, txtBlogTags.value);
        });
        Array.from(btnDepartmentSoftDelete).forEach(btn => {
          btn.addEventListener('click', e => {
            e.preventDefault();
            const id = btn.dataset.id;
            const ref = _database.ref('departments/' + id);
            console.log(obj.departments[id].visible);
            if (obj.departments[id].visible === true) {
              softDelete(ref, false);
              obj.departments[id].visible = false;
              btn.innerHTML = 'Soft Undelete';
            } else {
              softDelete(ref, true);
              obj.departments[id].visible = true;
              btn.innerHTML = 'Soft Delete';
            }
          });
        });
        Array.from(btnDepartmentHardDelete).forEach(btn => {
          btn.addEventListener('click', e => {
            e.preventDefault();
            const departmentId = btn.dataset.id;
            const ref = _database.ref('departments/' + departmentId);
            hardDelete(ref);
            delete obj.departments[departmentId];
          });
        });
        Array.from(btnArticleSoftDelete).forEach(btn => {
          btn.addEventListener('click', e => {
            e.preventDefault();
            const articleId = btn.dataset.articleid;
            const departmentId = btn.dataset.departmentid;
            const ref = _database.ref('blog/' + departmentId + '/' + articleId);
            console.log(obj.blog[departmentId][articleId].visible);
            if (obj.blog[departmentId][articleId].visible === true) {
              softDelete(ref, false);
              obj.blog[departmentId][articleId].visible = false;
              btn.innerHTML = 'Soft Undelete';
            } else {
              softDelete(ref, true);
              obj.blog[departmentId][articleId].visible = true;
              btn.innerHTML = 'Soft Delete';
            }
          });
        });
        Array.from(btnArticleHardDelete).forEach(btn => {
          btn.addEventListener('click', e => {
            e.preventDefault();
            const articleId = btn.dataset.articleid;
            const departmentId = btn.dataset.departmentid;
            const ref = _database.ref('blog/' + departmentId + '/' + articleId);
            hardDelete(ref);
            delete obj.blog[departmentId][articleId];
          });
        });
        Array.from(btnSpecializationSoftDelete).forEach(btn => {
          btn.addEventListener('click', e => {
            e.preventDefault();
            const specializationId = btn.dataset.specializationid;
            const departmentId = btn.dataset.departmentid;
            const ref = _database.ref('departments/' + departmentId + '/specializations/' + specializationId);
            console.log(obj.departments[departmentId].specializations[specializationId].visible);
            if (obj.departments[departmentId].specializations[specializationId].visible === true) {
              softDelete(ref, false);
              obj.departments[departmentId].specializations[specializationId].visible = false;
              btn.innerHTML = 'Soft Undelete';
            } else {
              softDelete(ref, true);
              obj.departments[departmentId].specializations[specializationId].visible = true;
              btn.innerHTML = 'Soft Delete';
            }
          });
        });
        Array.from(btnSpecializationHardDelete).forEach(btn => {
          btn.addEventListener('click', e => {
            e.preventDefault();
            const specializationId = btn.dataset.specializationid;
            const departmentId = btn.dataset.departmentid;
            const ref = _database.ref('departments/' + departmentId + '/specializations/' + specializationId);
            hardDelete(ref);
            delete obj.departments[departmentId].specializations[specializationId];
          });
        });
        Array.from(btnProjectSoftDelete).forEach(btn => {
          btn.addEventListener('click', e => {
            e.preventDefault();
            const projectId = btn.dataset.projectid;
            const authorId = btn.dataset.authorid;
            console.log(obj.projects[projectId].visible);
            if (obj.projects[projectId].visible === true) {
              softDeleteProject(projectId, authorId, false);
              obj.projects[projectId].visible = false;
              btn.innerHTML = 'Soft Undelete';
            } else {
              softDeleteProject(projectId, authorId, true);
              obj.projects[projectId].visible = true;
              btn.innerHTML = 'Soft Delete';
            }
          });
        });
        Array.from(btnProjectHardDelete).forEach(btn => {
          btn.addEventListener('click', e => {
            e.preventDefault();
            const projectId = btn.dataset.projectid;
            const authorId = btn.dataset.authorid;
            hardDeleteProject(projectId, authorId);
            delete obj.projects[projectId];
          });
        });
      }
      projectRef.on('value', (snap) => {
        projectObj = snap.val();
        obj = { departments: departmentObj, blog: blogObj, projects: projectObj };
        compileTemplate();
      });
      departmentRef.on('value', (snap) => {
        departmentArr.length = 0;
        departmentObj = snap.val();
        snap.forEach((snapChild) => {
          const key = snapChild.key;
          departmentObj[key].formattedDate = dateString(snapChild.val().createdDate);
          console.log(departmentObj[key].formattedDate);
          const opt = document.createElement('option');
          opt.value = snapChild.key;
          opt.innerHTML = snapChild.val().name;
          departmentArr.push(opt);
        });
        obj = { departments: departmentObj, blog: blogObj, projects: projectObj };
        compileTemplate();
      });
      blogRef.on('value', (snap) => {
        blogObj = snap.val();
        obj = { departments: departmentObj, blog: blogObj, projects: projectObj };
        compileTemplate();
        console.log(obj);
      });
    });
}

function generateSpecializationTemplate () {
  AJAX.loadTextByPromise(`../templates/specialization.hbs`).then(
    (data) => {
      let container = document.querySelector('.specializationContainer');
      const id = window.location.search.substr(1).split('&');
      let departmentId = id[0];
      var departmentName;
      let specializationId = id[1];
      const ref = _database.ref('departments/' + departmentId + '/specializations/' + specializationId);
      const departmentRef = _database.ref('departments/' + departmentId);
      console.log(departmentId);
      console.log(specializationId);
      departmentRef.once('value', (snap) => {
        departmentName = snap.val().name;
      }).then(e => {
        ref.once('value', (snap) => {
          const template = Handlebars.compile(data);
          console.log(departmentName);
          const obj = { specialization: snap.val(), departmentName: departmentName };
          const html = template(obj);
          container.innerHTML = html;
        });
      });
    });
}

function hardDelete (ref) {
  ref.set(null)
    .then(e => {
      console.log('Succesfully harddeleted item');
    }).catch(e => {
      console.log(e.message);
    });
}

function softDelete (ref, bool) {
  ref.update({
    visible: bool
  }).then(e => {
    console.log('Succesfully softdeleted item');
  }).catch(e => {
    console.log(e.message);
  });
}

function softDeleteProject (projectId, authorId, bool) {
  const updates = {};
  updates['/projects/' + projectId + '/visible'] = bool;
  updates['/user-projects/' + authorId + '/' + projectId + '/visible'] = bool;
  const promise = _database.ref().update(updates);
  promise.then(e => {
    console.log('Project succesfully softdeleted');
  });
  promise.catch(e => {
    console.log(e.message);
  });
}

function hardDeleteProject (projectId, authorId) {
  const updates = {};
  updates['/projects/' + projectId] = null;
  updates['/user-projects/' + authorId + '/' + projectId] = null;
  _database.ref().update(updates)
    .then(e => {
      console.log('Project succesfully harddeleted');
    })
    .catch(e => {
      console.log(e.message);
    });
}

function CreateProject (title, body, btnUploadFiles, synopsis, departmentId, tags, specializationId) {
  _auth.onAuthStateChanged(firebaseUser => {
    if (firebaseUser) {
      const tagArray = tags.toString().split(' ');
      const obj = tagArray.filter(v => v !== '').reduce(function (obj, v) { obj[v] = true; return obj; }, {});
      // User information
      const uid = firebaseUser.uid;
      const author = firebaseUser.displayName;
      // Create a project entry
      const projectData = {
        author: author,
        uid: uid,
        title: title,
        body: body,
        synopsis: synopsis,
        tags: obj,
        departmentId: departmentId,
        specializationId: specializationId,
        favoriteCount: 0,
        visible: true,
        createdDate: firebase.database.ServerValue.TIMESTAMP
      };
      // Get a key for a new project
      const newProjectKey = _database.ref().child('projects').push().key;
      // Write the new projects data simultaneously in the projects list and the user's project list.
      const updates = {};
      updates['/projects/' + newProjectKey] = projectData;
      updates['/user-projects/' + uid + '/' + newProjectKey] = projectData;
      const promise = _database.ref().update(updates);
      promise.then(e => {
        console.log(btnUploadFiles.length);
        for (var i = 0; i < btnUploadFiles.length; i++) {
          console.log(btnUploadFiles[1]);
          var imageFile = btnUploadFiles[i];
          uploadImageAsPromise(imageFile, newProjectKey, uid);
        }
      });
    } else {
      console.log("You're not logged it so not allowed to create a project");
      const createProjectContainerElement = document.querySelector('.createProjectContainer');
      createProjectContainerElement.innerHTML = '<h3> Please <a href="/login">Log in</a> to create a project </h3>';
    }
  });
}

function createDepartment (name, address, description, facebookUri, twitterUri, instagramUri) {
  _auth.onAuthStateChanged(firebaseUser => {
    if (firebaseUser) {
      // Get a new key for the department
      const newDepartmentKey = _database.ref().child('departments').push().key;
      _database.ref('departments/' + newDepartmentKey).set({
        name: name,
        description: description,
        address: address,
        facebookUri: facebookUri,
        instagramUri: instagramUri,
        twitterUri: twitterUri,
        author: firebaseUser.displayName,
        authorId: firebaseUser.uid,
        createdDate: firebase.database.ServerValue.TIMESTAMP,
        visible: true
      }).then(e => {
        console.log('Department Succesfully added');
      }).catch(e => {
        console.log(e.message);
      });
    }
  });
}

function createSpecialization (name, description, departmentId) {
  _auth.onAuthStateChanged(firebaseUser => {
    if (firebaseUser) {
      const newSpecializationKey = _database.ref('departments/' + departmentId).child('specializations').push().key;
      _database.ref('departments/' + departmentId + '/specializations/' + newSpecializationKey).set({
        name: name,
        description: description,
        author: firebaseUser.displayName,
        authorId: firebaseUser.uid,
        createdDate: firebase.database.ServerValue.TIMESTAMP,
        visible: true
      }).then(e => {
        console.log('Specialization succesfully added');
      }).catch(e => {
        console.log(e.message);
      });
    }
  });
}

function createArticle (title, body, department, tags) {
  _auth.onAuthStateChanged(firebaseUser => {
    if (firebaseUser) {
      const tagArray = tags.toString().split(' ');
      const obj = tagArray.filter(v => v !== '').reduce(function (obj, v) { obj[v] = true; return obj; }, {});
      // Get a new key for the article
      const newDepartmentKey = _database.ref().child('blog/' + department).push().key;
      const promise = _database.ref('blog/' + department + '/' + newDepartmentKey).set({
        title: title,
        body: body,
        tags: obj,
        author: firebaseUser.displayName,
        authorId: firebaseUser.uid,
        createdDate: firebase.database.ServerValue.TIMESTAMP,
        visible: true
      });
      promise.then(e => {
        console.log('Article Succesfully added');
      });
      promise.catch(e => {
        console.log(e.message);
      });
    }
  });
}

function renderTemplate (data, obj, containerElement) {
  console.log(obj);
  const template = Handlebars.compile(data);
  const html = template(obj);
  containerElement.innerHTML = html;
}

function uploadImageAsPromise (imageFile, projectId, authorId) {
  return new Promise(function (resolve, reject) {
    var storageRef = _storage.ref(projectId + '/' + imageFile.name);

    // Upload file
    var task = storageRef.put(imageFile);

    // Update progress bar
    task.on('state_changed',
      function progress (snapshot) {
        var percentage = snapshot.bytesTransferred / snapshot.totalBytes * 100;
        console.log(percentage);
        // uploader.value = percentage;
      },
      function error (err) {
        console.log(err.message);
      },
      function complete () {
        var downloadURL = task.snapshot.downloadURL;
        console.log(downloadURL);
        const newImageKey = _database.ref().child('projects/' + projectId + '/images').push().key;
        const updates = {};
        updates['/projects/' + projectId + '/images/' + newImageKey] = downloadURL;
        updates['/user-projects/' + authorId + '/' + projectId + '/images/' + newImageKey] = downloadURL;
        _database.ref().update(updates)
          .then(e => {
            console.log('New image entry created');
          })
          .catch(e => {
            console.log(e.message);
          });
      }
    );
  });
}

function followUser (followUid) {
  _auth.onAuthStateChanged(firebaseUser => {
    if (firebaseUser) {
      const refUsers = _database.ref('users/' + followUid + '/followers');
      refUsers.once('value', (snap) => {
        if (snap.hasChild(firebaseUser.uid)) {
          console.log('Already following user');
          toggleFollow(null, followUid, firebaseUser.uid);
        } else {
          toggleFollow(true, followUid, firebaseUser.uid);
        }
      });
    } else {
      window.location = '/login';
    }
  });
}

function shortDateString (createdDate) {
  const date = new Date(createdDate);
  return `${date.getDate()}-${(date.getMonth() + 1)}-${date.getFullYear().toString().substr(-2)}`;
}

function toggleFollow (bool, followUid, currentUid) {
  const refFollow = _database.ref('users/' + followUid);
  const refCurrent = _database.ref('users/' + currentUid);
  const updates = {};
  updates['/users/' + followUid + '/followers/' + currentUid] = bool;
  updates['/users/' + currentUid + '/following/' + followUid] = bool;
  _database.ref().update(updates).then(e => {
    refFollow.transaction((snap) => {
      if (snap != null) {
        if (bool === true) {
          snap.followerCount++;
        } else if (bool === null) {
          snap.followerCount--;
        }
      } else {
        snap = 1;
      }
      return snap;
    }, function (error, committed, snapshot) {
      if (error) {
        console.log('error in transaction');
      } else if (!committed) {
        console.log('transaction not committed');
      } else {
        console.log('Transaction Committed');
      }
    }, true);
    refCurrent.transaction((snap) => {
      if (snap != null) {
        if (bool === true) {
          snap.followingCount++;
        } else if (bool === null) {
          snap.followingCount--;
        }
      } else {
        snap = 1;
      }
      return snap;
    }, function (error, committed, snapshot) {
      if (error) {
        console.log('error in transaction');
      } else if (!committed) {
        console.log('transaction not committed');
      } else {
        console.log('Transaction Committed');
      }
    }, true);
  })
    .catch(e => {
      console.log(e.message);
    });
}

function favoriteString (amount) {
  if (amount === 1) {
    return `${amount} persoon vindt dit leuk`;
  } else if (amount > 1) {
    return `${amount} personen vinden dit leuk.`;
  } else if (amount === 0) {
    return `Wees de eerste om dit project leuk te vinden.`;
  }
}

function dateString (createdDate) {
  const date = new Date(createdDate);
  let days = ['Zondag', 'Maandag', 'Dindsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];
  let months = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
  return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()} om ${(date.getHours() < 10 ? '0' : '') + date.getHours()}:${(date.getMinutes() < 10 ? '0' : '') + date.getMinutes()}`;
}

function AddToFavorite (authorId, projectId) {
  _auth.onAuthStateChanged(firebaseUser => {
    if (firebaseUser) {
      const uid = firebaseUser.uid;
      console.log('UID: ' + uid);
      console.log('AuthorID: ' + authorId);
      console.log('ProjectId: ' + projectId);
      const projectLikesRef = _database.ref('/project-likes/' + uid);
      const globalProjectRef = _database.ref('/projects/' + projectId);
      const userProjectRef = _database.ref('/user-projects/' + authorId + '/' + projectId);
      projectLikesRef.once('value', e => {
        if (e.hasChild(projectId) === true) {
          const promise = projectLikesRef.update({ [projectId]: null });
          promise.then(e => {
            console.log('Favorite succesvol verwijderd');
            toggleFavorite(globalProjectRef, uid, false);
            toggleFavorite(userProjectRef, uid, false);
          });
          promise.catch(e => {
            console.log(e.message);
          });
        } else {
          const promise = projectLikesRef.update({ [projectId]: true });
          promise.then(e => {
            console.log('Favorite succesvol toegevoegd');
            toggleFavorite(globalProjectRef, uid, true);
            toggleFavorite(userProjectRef, uid, true);
          });
          promise.catch(e => {
            console.log(e.message);
          });
        }
      });
    }
  });
}

function toggleFavorite (projectReference, uid, bool) {
  projectReference.transaction(function (project) {
    if (project != null) {
      if (bool === false) {
        project.favoriteCount--;
      } else if (bool === true) {
        project.favoriteCount++;
      }
    } else {
      project = 1;
    }
    return project;
  }, function (error, committed, snapshot) {
    if (error) {
      console.log('error in transaction');
    } else if (!committed) {
      console.log('transaction not committed');
    } else {
      console.log('Transaction Committed');
    }
  }, true);
}

function stopRefs () {
  // Turn off all firebase references and clear the array.
  firebaseRefs.forEach(function (ref) {
    ref.off();
  });
  firebaseRefs.length = 0;
}

// Epochs
const epochs = [
  ['year', 31536000],
  ['month', 2592000],
  ['day', 86400],
  ['hour', 3600],
  ['minute', 60],
  ['second', 1],
  ['second', -1]
];

// Get duration
function getDuration (timeAgoInSeconds) {
  for (let [name, seconds] of epochs) {
    const interval = Math.floor(timeAgoInSeconds / seconds);
    if (interval >= 1) {
      return {
        interval: interval,
        epoch: name
      };
    }
  }
}

// Calculate
const timeAgo = (date) => {
  const timeAgoInSeconds = Math.floor((new Date() - new Date(date)) / 1000);
  var pos = timeAgoInSeconds;
  if (pos < 1) {
    if (pos === 0) {
      pos++;
    } else {
      pos = -pos;
    }
  }
  const { interval, epoch } = getDuration(pos);
  const suffix = interval === 1 ? '' : 's';
  return `${interval} ${epoch}${suffix} ago`;
};
function createLoginStateElement (bool, element) {
  if (bool === true) {
    element.innerHTML = 'Log out';
    element.addEventListener('click', e => {
      Logout();
    });
  } else if (bool === false) {
    element.innerHTML = 'Sign in/up';
  }
}

function Logout () {
  _auth.signOut();
}

function Login () {
  const txtEmail = document.getElementById('email');
  const txtPassword = document.getElementById('password');
  const btnLogin = document.getElementById('btnLogin');
  btnLogin.addEventListener('click', e => {
    const promise = _auth.signInWithEmailAndPassword(txtEmail.value, txtPassword.value);
    promise.then(e => {
      console.log('Starting login ....');
      window.location = '/project';
    });
    promise.catch(e => console.log(e.message));
  });
}

function Register () {
  const txtEmail = document.getElementById('email');
  const txtPassword = document.getElementById('password');
  const txtName = document.getElementById('name');
  const btnRegister = document.getElementById('btnRegister');

  btnRegister.addEventListener('click', e => {
    e.preventDefault();
    console.log('Starting registering.');
    const promise = _auth.createUserWithEmailAndPassword(txtEmail.value, txtPassword.value);
    // Update user with displayName
    promise.then(e => {
      console.log(txtEmail.value);
      const user = firebase.auth().currentUser;
      console.log('Start creating user ...');
      if (user != null) {
        user.updateProfile({
          displayName: txtName.value
        }).then(function () {
          console.log('DisplayName added succesfully.');
          // Store user in realtime database
          _database.ref('users/' + user.uid).set({
            email: user.email,
            name: user.displayName,
            followerCount: 0,
            followingCount: 0,
            createdDate: firebase.database.ServerValue.TIMESTAMP,
          }).then(e => {
            console.log('Added needed user-info to realtime database');
            window.location = '/project';
          }).catch(e => {
            console.log(e.message);
          });
        }).catch(function (error) {
          console.log('Failed to add DisplayName.');
        })
      } else {
        console.log('no user');
      }
    });
    promise.catch(e => console.log(e.message));
  });
}

function CreateComment (text) {
  _auth.onAuthStateChanged(firebaseUser => {
    if (firebaseUser) {
      const author = firebaseUser.displayName;
      const uid = firebaseUser.uid;
      _database.ref('project-comments/' + getParameterFromUrl()).push({
        text: text,
        author: author,
        uid: uid,
        createdDate: firebase.database.ServerValue.TIMESTAMP,
        visible: true
      });
    } else {
      window.location = '/login';
    }
  });
}

function getParameterFromUrl () {
  const id = window.location.search.substr(1);
  return id;
}

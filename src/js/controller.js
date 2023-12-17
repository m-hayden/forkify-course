import * as model from './model.js';
import recipeView from './views/recipeView.js';
import resultsView from './views/resultsView.js';
import addRecipeView from './views/addRecipeView.js';
import searchView from './views/searchView.js';
import paginationView from './views/paginationView.js';
import bookmarkView from './views/bookmarkView.js';
import 'core-js/stable';
import 'regenerator-runtime';
import { MODEL_CLOSE_SEC } from './config.js';

// if (module.hot) {
//   module.hot.accept();
// }

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;
    recipeView.renderSpinner();

    resultsView.update(model.getSearchResultsPage());
    bookmarkView.update(model.state.bookmarks);

    await model.loadRecipe(id);

    const { recipe } = model.state;
    recipeView.render(model.state.recipe);
  } catch (err) {
    console.error(err);
    recipeView.renderError();
  }
};

const controlSearchResults = async function () {
  try {
    const query = searchView.getQeury();
    if (!query) return;
    resultsView.renderSpinner();

    await model.loadSearchResults(`${query}`);

    const { search } = model.state;

    resultsView.render(model.getSearchResultsPage());
    paginationView.render(model.state.search);
  } catch (err) {
    resultsView.renderError();
  }
};

const controlPagination = function (goToPage) {
  resultsView.render(model.getSearchResultsPage(goToPage));
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // Update the recipe servings (in state)
  model.updateServings(newServings);
  // Update the recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.removeBookmark(model.state.recipe.id);

  recipeView.update(model.state.recipe);

  bookmarkView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarkView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    addRecipeView.renderSpinner();

    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe)

    recipeView.render(model.state.recipe);

    addRecipeView.renderMessage();

    bookmarkView.render(model.state.bookmarks);

    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    setTimeout(function() {
      addRecipeView.toggleWindow();
    }, MODEL_CLOSE_SEC * 1000)
  } catch (err) {
    addRecipeView.renderError(err.message);
  }
};

const init = function () {
  bookmarkView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();

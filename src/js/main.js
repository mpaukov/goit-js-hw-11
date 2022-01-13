import { Notify } from 'notiflix/build/notiflix-notify-aio';
import debounce from 'lodash.debounce';

import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

import ServiceAPI from './service-api';
import markup from './markup';

const DEBOUNCE_DELAY = 300;

const form = document.querySelector('.search-form');
const searchButton = document.querySelector('[type=submit]');
const gallery = document.querySelector('.gallery');
const loadService = new ServiceAPI();

form.addEventListener('submit', onFormSubmit);

document.addEventListener('scroll', debounce(loadMore, DEBOUNCE_DELAY));

function onFormSubmit(e) {
  e.preventDefault();
  searchButton.disabled = true;
  const isFilled = e.currentTarget.elements.searchQuery.value;
  if (isFilled) {
    loadService.searchQuery = isFilled;
    loadService.resetPage();
    gallery.innerHTML = '';
    loadPictures();
  }
}

function loadMore() {
  if (gallery.scrollHeight - window.scrollY < 1000) {
    loadPictures();
  }
}

function loadPictures() {
  loadService
    .getPictures()
    .then(dataProcessing)
    .catch(error => {
      console.log(error);
      Notify.failure('Something went wrong, please try again...');
    });
}

function dataProcessing(data) {
  searchButton.disabled = false;
  if (data.data.totalHits === 0) {
    Notify.failure('Sorry, there are no images matching your search query. Please try again.');
    return;
  }
  if (data.data.totalHits !== 0 && data.data.hits.length === 0) {
    Notify.warning(`We're sorry, but you've reached the end of search results.`);
    return;
  }

  gallery.insertAdjacentHTML('beforeend', markup(data.data.hits));

  galleryLightBox.refresh();

  if (loadService.pageNumber === 2) {
    Notify.info(`Hooray! We found ${data.data.totalHits} images.`);
  } else {
    const { height: cardHeight } = gallery.firstElementChild.getBoundingClientRect();
    window.scrollBy({
      top: cardHeight * 2 + 120,
      behavior: 'smooth',
    });
  }
}

let galleryLightBox = new SimpleLightbox('.gallery a', {
  captions: true,
  captionsData: 'alt',
  captionDelay: 250,
});

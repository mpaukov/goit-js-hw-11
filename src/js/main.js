import { Notify } from 'notiflix/build/notiflix-notify-aio';
import ServiceAPI from './service-api';
import markup from './markup';

const form = document.querySelector('.search-form');
const loadMoreBtn = document.querySelector('.load-more');
const gallery = document.querySelector('.gallery');
const loadService = new ServiceAPI();

form.addEventListener('submit', onFormSubmit);
loadMoreBtn.addEventListener('click', loadMore);

function onFormSubmit(e) {
  e.preventDefault();
  const isFilled = e.currentTarget.elements.searchQuery.value;
  if (isFilled) {
    loadService.searchQuery = isFilled;
    loadService.resetPage();
    gallery.innerHTML = '';
    loadMore();
  }
}

function loadMore() {
  loadService
    .getPictures()
    .then(dataProcessing)
    .catch(error => {
      console.log(error);
    });
}

function dataProcessing(data) {
  if (data.data.totalHits === 0) {
    Notify.failure('Sorry, there are no images matching your search query. Please try again.');

    return;
  }
  if (data.data.totalHits !== 0 && data.data.hits.length === 0) {
    Notify.warning(`We're sorry, but you've reached the end of search results.`);
  }
  if (loadService.pageNumber === 2) {
    Notify.info(`Hooray! We found ${data.data.totalHits} images.`);
  }
  gallery.insertAdjacentHTML('beforeend', markup(data.data.hits));
}

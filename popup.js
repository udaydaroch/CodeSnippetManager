document.addEventListener('DOMContentLoaded', () => {
  const snippetForm = document.getElementById('snippetForm');
  const snippetList = document.getElementById('snippetList');
  const searchInput = document.getElementById('searchInput');
  const searchButton = document.getElementById('searchButton');
  const tagFilter = document.getElementById('tagFilter');
  const prevPageButton = document.getElementById('prevPage');
  const nextPageButton = document.getElementById('nextPage');

  let snippets = []; // Array to hold all snippets
  let tags = []; // Array to hold all unique tags
  let filteredSnippets = []; // Array to hold filtered snippets
  let currentPage = 1;
  const itemsPerPage = 1; // Display one result per page

  // Load snippets and tags from storage
  chrome.storage.sync.get(['snippets', 'tags'], (result) => {
    snippets = result.snippets || [];
    tags = result.tags || [];
    populateTagFilter();
  });

  // Save snippet on form submission
  snippetForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const title = document.getElementById('title').value.trim();
    const code = document.getElementById('code').value.trim();
    const description = document.getElementById('description').value.trim();
    const tagsInput = document.getElementById('tags').value.trim().split(',').map(tag => tag.trim()).filter(tag => tag);

    const snippet = { title, code, description, tags: tagsInput };

    snippets.push(snippet);
    chrome.storage.sync.set({ snippets });

    tagsInput.forEach(tag => {
      if (!tags.includes(tag)) {
        tags.push(tag);
      }
    });
    chrome.storage.sync.set({ tags });

    snippetForm.reset();

    populateTagFilter();
  });

  searchButton.addEventListener('click', () => {
    currentPage = 1; 
    updateSnippetList();
  });

  prevPageButton.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      updateSnippetList();
    }
  });

  nextPageButton.addEventListener('click', () => {
    const maxPage = Math.ceil(filteredSnippets.length / itemsPerPage);
    if (currentPage < maxPage) {
      currentPage++;
      updateSnippetList();
    }
  });

  function updateSnippetList() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const selectedTag = tagFilter.value.toLowerCase();

    filteredSnippets = snippets.filter(snippet => {
      const { title, tags } = snippet;
      return title.toLowerCase().includes(searchTerm) && (selectedTag === '' || tags.map(tag => tag.toLowerCase()).includes(selectedTag));
    });

    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedSnippets = filteredSnippets.slice(startIndex, startIndex + itemsPerPage);

    snippetList.innerHTML = '';
    paginatedSnippets.forEach((snippet, index) => {
      displaySnippet(snippet, index + startIndex);
    });

    snippetList.style.display = filteredSnippets.length > 0 ? 'block' : 'none';

    const maxPage = Math.ceil(filteredSnippets.length / itemsPerPage);
    prevPageButton.classList.toggle('disabled', currentPage === 1);
    nextPageButton.classList.toggle('disabled', currentPage === maxPage);
  }

  function displaySnippet(snippet, index) {
    const snippetElem = document.createElement('div');
    snippetElem.classList.add('snippet');
    snippetElem.innerHTML = `
      <h3>${snippet.title}</h3>
      <pre>${snippet.code}</pre>
      <p>${snippet.description}</p>
      <p>Tags: ${snippet.tags.join(', ')}</p>
      <button class="deleteBtn" data-index="${index}">Delete</button>
      <button class="copyBtn" data-index="${index}">Copy</button>
    `;
    snippetList.appendChild(snippetElem);

    const deleteBtn = snippetElem.querySelector('.deleteBtn');
    deleteBtn.addEventListener('click', () => {
      snippets.splice(index, 1);
      chrome.storage.sync.set({ snippets });
      updateSnippetList();
    });

    const copyBtn = snippetElem.querySelector('.copyBtn');
    copyBtn.addEventListener('click', () => {
      const codeToCopy = snippets[index].code;
      navigator.clipboard.writeText(codeToCopy).then(() => {
        alert('Code snippet copied to clipboard!');
      }).catch(err => {
        console.error('Could not copy text: ', err);
      });
    });
  }

  function populateTagFilter() {
    tagFilter.innerHTML = '<option value="">All</option>';
    tags.forEach(tag => {
      const option = document.createElement('option');
      option.value = tag;
      option.textContent = tag;
      tagFilter.appendChild(option);
    });
  }
});

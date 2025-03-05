document.addEventListener('DOMContentLoaded', () => {
    const loginLink = document.getElementById('login-link');
    const registerLink = document.getElementById('register-link');
    const logoutLink = document.getElementById('logout-link');
    const blogForm = document.getElementById('blog-form');
    const createBlogForm = document.getElementById('create-blog-form');
    const blogList = document.getElementById('blog-list');
  
    let token = localStorage.getItem('token');
  
    if (token) {
      loginLink.style.display = 'none';
      registerLink.style.display = 'none';
      logoutLink.style.display = 'inline';
      blogForm.style.display = 'block';
      fetchBlogs();
    }
  
    loginLink.addEventListener('click', () => {
      const username = prompt('Enter username:');
      const password = prompt('Enter password:');
      fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          if (data.token) {
            localStorage.setItem('token', data.token);
            token = data.token;
            loginLink.style.display = 'none';
            registerLink.style.display = 'none';
            logoutLink.style.display = 'inline';
            blogForm.style.display = 'block';
            fetchBlogs();
          } else {
            alert('Invalid credentials');
          }
        })
        .catch(error => {
          console.error('Fetch error:', error);
          alert('Failed to connect to the server');
        });
    });
  
    registerLink.addEventListener('click', () => {
      const username = prompt('Enter username:');
      const password = prompt('Enter password:');
      fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          alert('Registration successful');
        })
        .catch(error => {
          console.error('Fetch error:', error);
          alert('Failed to connect to the server');
        });
    });
  
    logoutLink.addEventListener('click', () => {
      localStorage.removeItem('token');
      token = null;
      loginLink.style.display = 'inline';
      registerLink.style.display = 'inline';
      logoutLink.style.display = 'none';
      blogForm.style.display = 'none';
      blogList.innerHTML = '';
    });
  
    createBlogForm.addEventListener('submit', event => {
      event.preventDefault();
      const title = document.getElementById('title').value;
      const content = document.getElementById('content').value;
      const category = document.getElementById('category').value;
      fetch('http://localhost:3001/api/blogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content, category }),
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          fetchBlogs();
          createBlogForm.reset();
        })
        .catch(error => {
          console.error('Fetch error:', error);
          alert('Failed to connect to the server');
        });
    });
  
    function fetchBlogs() {
      fetch('http://localhost:3001/api/blogs')
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          blogList.innerHTML = '';
          data.forEach(blog => {
            const blogItem = document.createElement('div');
            blogItem.classList.add('blog-item');
            blogItem.innerHTML = `
              <h2>${blog.title}</h2>
              <p>${blog.content}</p>
              <p><strong>Category:</strong> ${blog.category}</p>
            `;
            blogList.appendChild(blogItem);
          });
        })
        .catch(error => {
          console.error('Fetch error:', error);
          alert('Failed to fetch blogs');
        });
    }
  });
  
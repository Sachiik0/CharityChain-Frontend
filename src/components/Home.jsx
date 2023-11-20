import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const HomePage = () => {
  return (
    <div className="container mt-5">
      <div className="jumbotron">
        <h1 className="display-4">Welcome to My Website</h1>
        <p className="lead">This is a simple and clean homepage using Bootstrap.</p>
        <hr className="my-4" />
        <p>Explore the content and enjoy your stay!</p>
        <a className="btn btn-primary btn-lg" href="#" role="button">
          Learn more
        </a>
      </div>

      <div className="row">
        <div className="col-md-4">
          <h2>Section 1</h2>
          <p>
            This is some content for section 1. You can add more details or components here.
          </p>
        </div>
        <div className="col-md-4">
          <h2>Section 2</h2>
          <p>
            More content for section 2. You can customize this as needed for your homepage.
          </p>
        </div>
        <div className="col-md-4">
          <h2>Section 3</h2>
          <p>
            Additional details for section 3. Feel free to modify this according to your needs.
          </p>
        </div>
      </div>

      <footer className="mt-5">
        <p>&copy; 2023 Your Website</p>
      </footer>
    </div>
  );
};

export default HomePage;

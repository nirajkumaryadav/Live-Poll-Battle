import React from 'react';
import PropTypes from 'prop-types';
import './Layout.css';

const Layout = ({ children, title }) => {
  return (
    <div className="container">
      <h1>{title}</h1>
      {children}
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string
};

Layout.defaultProps = {
  title: 'Live Poll Battle'
};

export default Layout;
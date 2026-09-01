import React from 'react';
import { OutletMark } from './Navigation';
import { Tag } from './Marks';

export const Table = ({ children, className = '', ...props }) => (
  <table className={`tbl ${className}`} {...props}>{children}</table>
);

export const Thead = ({ children, className = '', ...props }) => (
  <thead className={className} {...props}>{children}</thead>
);

export const Tbody = ({ children, className = '', ...props }) => (
  <tbody className={className} {...props}>{children}</tbody>
);

export const Tr = ({ children, className = '', ...props }) => (
  <tr className={className} {...props}>{children}</tr>
);

export const Th = ({ children, isNumeric = false, className = '', ...props }) => (
  <th className={`${isNumeric ? 'num' : ''} ${className}`} {...props}>{children}</th>
);

export const Td = ({ children, isNumeric = false, className = '', ...props }) => (
  <td className={`${isNumeric ? 'num' : ''} ${className}`} {...props}>{children}</td>
);

export const OwnershipRow = ({ 
  outletInitials, 
  outletName, 
  type, 
  ownerName, 
  proximity, 
  className = '' 
}) => (
  <div className={`own ${className}`}>
    <div className="l1">
      <OutletMark initials={outletInitials} />
      <span className="nm">{outletName}</span>
      {type && <Tag variant="outline">{type}</Tag>}
    </div>
    <div className="l2">
      {ownerName} 
      {proximity && (
        <>
          {' · '}
          <span className="prox">proximity: {proximity} (documented)</span>
        </>
      )}
    </div>
  </div>
);

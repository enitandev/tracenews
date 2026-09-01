import React, { useState } from 'react';
import { Tag } from './Marks';

export const OwnershipPopover = ({ data, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // data = { type: 'Corporate', owner: '...', proximity: 'APC — documented' }
  
  return (
    <span 
      className={`pop ${className}`} 
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <Tag variant="outline">Ownership</Tag>
      
      {isOpen && (
        <span className="panel">
          <span className="ph">
            <span className="t">Ownership</span>
            {data.type && <Tag variant="outline">{data.type}</Tag>}
          </span>
          {data.owner && (
            <p className="line">
              <span className="k">Owner</span>
              {data.owner}
            </p>
          )}
          {data.proximity && (
            <p className="line">
              <span className="k">Party proximity</span>
              <span className="prox">{data.proximity}</span>
            </p>
          )}
          <p className="note">
            Shown only where ownership or affiliation is a matter of public record. Proximity is a recorded fact, not an inference about coverage.
          </p>
        </span>
      )}
    </span>
  );
};

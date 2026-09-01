import React from 'react';
import { IconCheck, IconAlertTriangle } from '@tabler/icons-react';
import { Button } from './Button';

export const Modal = ({ title, description, isOpen, onClose, primaryAction, primaryText = 'Confirm', children, className = '' }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className={`modal ${className}`}>
        {title && <p className="mh">{title}</p>}
        {description && <p className="mb">{description}</p>}
        
        {children}
        
        <div className="mf">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          {primaryAction && (
            <Button variant="primary" onClick={primaryAction}>{primaryText}</Button>
          )}
        </div>
      </div>
    </div>
  );
};

export const Toast = ({ message, type = 'success', className = '' }) => (
  <span className={`toast ${type === 'error' ? 'err' : ''} ${className}`}>
    {type === 'error' ? (
      <IconAlertTriangle size={16} stroke={1.5} />
    ) : (
      <IconCheck size={16} stroke={1.5} />
    )}
    {message}
  </span>
);

export const SkeletonLine = ({ width = '100%', height = '11px', className = '', style = {} }) => (
  <div className={`skel skel-line ${className}`} style={{ width, height, ...style }}></div>
);

export const SkeletonBlock = ({ width = '100%', height = '100%', className = '', style = {} }) => (
  <div className={`skel ${className}`} style={{ width, height, ...style }}></div>
);

export const EmptyState = ({ title, message, action, actionText, className = '' }) => (
  <div className={`empty ${className}`}>
    <div className="ttl">{title}</div>
    <p className="msg">{message}</p>
    {action && (
      <Button variant="secondary" size="sm" onClick={action}>{actionText}</Button>
    )}
  </div>
);

export const ErrorBox = ({ title, message, className = '' }) => (
  <div className={`errbox ${className}`}>
    <div className="ttl">{title}</div>
    <p className="msg">{message}</p>
  </div>
);

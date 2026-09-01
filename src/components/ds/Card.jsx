import React from 'react';
import { Link } from 'react-router-dom';
import { Tag, TierDotLabel } from './Marks';
import { OutletMark } from './Navigation';
import { OwnershipPopover } from './Popover';
import { IconArrowRight } from '@tabler/icons-react';

export const Card = ({ children, className = '', ...props }) => (
  <div className={`card ${className}`} {...props}>{children}</div>
);

export const CardHead = ({ children, className = '' }) => (
  <div className={`card-head ${className}`}>{children}</div>
);

export const ArticleCard = ({ 
  outletInitials, 
  outletName, 
  tier, 
  title, 
  excerpt, 
  timeAgo, 
  location, 
  slug,
  ownershipInfo,
  className = '' 
}) => (
  <Link to={`/story/${slug}`} className={`article ${className}`}>
    <div className="top">
      <OutletMark initials={outletInitials} />
      <span className="name">{outletName}</span>
      <span className="rt">
        {ownershipInfo && (
          <OwnershipPopover data={ownershipInfo} />
        )}
        <Tag variant={tier.toLowerCase()}>{tier}</Tag>
      </span>
    </div>
    <p className="hl">{title}</p>
    {excerpt && <p className="ex">{excerpt}</p>}
    <div className="btm">
      <span>{timeAgo}{location ? ` · ${location}` : ''}</span>
      <span className="read">Read Full Article <IconArrowRight size={14} stroke={1.5} /></span>
    </div>
  </Link>
);

export const StoryCard = ({ 
  slug, 
  imageUrl, 
  category, 
  title, 
  timeAgo,
  distribution = {},
  isPartial = false,
  className = '' 
}) => {
  const govt = distribution.pro_establishment || 0;
  const main = distribution.institutional || 0;
  const watch = distribution.adversarial || 0;
  const total = govt + main + watch || 1;

  return (
    <Link to={`/story/${slug}`} className={`story ${className}`}>
      <div className="thumb" style={{ backgroundImage: `url(${imageUrl || ''})` }}>
        {category && <span className="cat">{category}</span>}
      </div>
      <div className="in">
        <p className="hl">{title}</p>
        
        {/* Tier Distribution Bar */}
        <div className="tierbar" style={{ marginBottom: '8px' }}>
          {total === 1 && govt === 0 && main === 0 && watch === 0 ? (
             <i className="ghost" style={{ width: '100%' }}></i>
          ) : (
             <>
               {govt > 0 && <i style={{ width: `${(govt/total)*100}%`, background: 'var(--tier-govt)' }}></i>}
               {main > 0 && <i style={{ width: `${(main/total)*100}%`, background: 'var(--tier-main)' }}></i>}
               {watch > 0 && <i style={{ width: `${(watch/total)*100}%`, background: 'var(--tier-watch)' }}></i>}
             </>
          )}
        </div>

        <div className="smeta">
          {isPartial ? (
            <span className="conc"><span className="d"></span>Partial tier</span>
          ) : (
            <span className="tiers">
              <TierDotLabel variant="govt" count={govt} label="G" />
              <TierDotLabel variant="main" count={main} label="M" />
              <TierDotLabel variant="watch" count={watch} label="W" />
            </span>
          )}
          <span>{timeAgo}</span>
        </div>
      </div>
    </Link>
  );
};

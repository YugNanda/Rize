import { cn } from '../../utils/cn';

const Card = ({ children, className = '', ...props }) => (
  <div className={cn('card', className)} {...props}>
    {children}
  </div>
);

const CardHeader = ({ children, className = '' }) => (
  <div className={cn('px-5 py-4 border-b border-border', className)}>{children}</div>
);

const CardBody = ({ children, className = '' }) => (
  <div className={cn('p-5', className)}>{children}</div>
);

const CardFooter = ({ children, className = '' }) => (
  <div className={cn('px-5 py-4 border-t border-border', className)}>{children}</div>
);

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;

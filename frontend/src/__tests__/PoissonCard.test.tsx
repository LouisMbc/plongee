import { render, screen } from '@testing-library/react';
import PoissonCard from '../components/PoissonCard';
import '@testing-library/jest-dom';

// Mock de Next.js Link
jest.mock('next/link', () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
  MockLink.displayName = 'MockLink';
  return MockLink;
});

// Mock de Next.js Image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} />;
  },
}));

describe('PoissonCard Component', () => {
  const defaultProps = {
    species: 'Acanthurus coeruleus',
    genus: 'Acanthurus',
    specCode: 1234,
  };

  it('affiche les informations de base du poisson', () => {
    render(<PoissonCard {...defaultProps} />);
    
    expect(screen.getByText('Acanthurus coeruleus')).toBeInTheDocument();
    expect(screen.getByText('Acanthurus')).toBeInTheDocument();
    expect(screen.getByText('Détails →')).toBeInTheDocument();
  });

  it('affiche le nom commun si fourni', () => {
    render(
      <PoissonCard
        {...defaultProps}
        commonName="Blue tang surgeonfish"
      />
    );
    
    expect(screen.getByText('Blue tang surgeonfish')).toBeInTheDocument();
  });

  it('n\'affiche pas le nom commun s\'il n\'est pas fourni', () => {
    render(<PoissonCard {...defaultProps} />);
    
    expect(screen.queryByText('Nom commun:')).not.toBeInTheDocument();
  });

  it('affiche l\'image si l\'URL est fournie', () => {
    const imageUrl = 'https://example.com/fish.jpg';
    
    render(
      <PoissonCard
        {...defaultProps}
        imageUrl={imageUrl}
      />
    );
    
    const image = screen.getByAltText('Photo de Acanthurus coeruleus');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', imageUrl);
  });

  it('affiche un emoji de poisson si aucune image n\'est fournie', () => {
    render(<PoissonCard {...defaultProps} />);
    
    expect(screen.getByText('🐠')).toBeInTheDocument();
  });

  it('affiche un emoji de poisson si l\'URL est "NA"', () => {
    render(
      <PoissonCard
        {...defaultProps}
        imageUrl="NA"
      />
    );
    
    expect(screen.getByText('🐠')).toBeInTheDocument();
  });

  it('contient un lien vers la page de détails', () => {
    render(<PoissonCard {...defaultProps} />);
    
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/poissons/1234');
  });

  it('affiche "Base locale" et "Détails"', () => {
    render(<PoissonCard {...defaultProps} />);
    
    expect(screen.getByText('Base locale')).toBeInTheDocument();
    expect(screen.getByText('Détails →')).toBeInTheDocument();
  });

  it('affiche "Genre:" comme label', () => {
    render(<PoissonCard {...defaultProps} />);
    
    expect(screen.getByText('Genre:')).toBeInTheDocument();
  });

  it('gère les noms d\'espèces longs', () => {
    const longSpecies = 'Verylongnamethatmightbetoolongfordisplay';
    
    render(
      <PoissonCard
        {...defaultProps}
        species={longSpecies}
      />
    );
    
    expect(screen.getByText(longSpecies)).toBeInTheDocument();
  });

  it('gère les noms communs longs', () => {
    const longCommonName = 'This is a very long common name that might need to be truncated';
    
    render(
      <PoissonCard
        {...defaultProps}
        commonName={longCommonName}
      />
    );
    
    expect(screen.getByText(longCommonName)).toBeInTheDocument();
  });

  it('affiche correctement null comme commonName', () => {
    render(
      <PoissonCard
        {...defaultProps}
        commonName={null}
      />
    );
    
    expect(screen.queryByText('Nom commun:')).not.toBeInTheDocument();
  });
});

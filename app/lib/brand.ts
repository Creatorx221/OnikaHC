export const brand = {
  name: 'Heuresis Capital',
  email: 'info@heuresiscapital.com',
  domain: 'https://heuresiscapital.com',
  logo: '/logo-research-light.png',
  logoDark: '/logo-research-navy.png',
};

// Previously published settings may still refer to the earlier built-in logo path.
export function resolveBrandLogo(logo: string): string {
  return logo === '/logo-approved.png' ? brand.logo : logo;
}

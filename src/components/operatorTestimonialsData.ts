/* Default quotes — Figma 204:8333 (.com_2027). */

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  avatarSrc?: string;
}

export const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "“When asset management says, ‘You should really charge for parking again,’ you can say, ‘Of our last 25 tours, 20 people said they love that we offer free parking. This is a huge leasing advantage.’”",
    name: "Heather Crowley",
    role: "VP of Operations, Fulton Peak",
  },
  {
    quote: "“This is a great tool. It’s not here to make anybody feel bad. It’s here to elevate people.”",
    name: "Holly Sanford",
    role: "VP, Cowboy Properties",
  },
  {
    quote:
      "“What I really like is that after a tour, you can ask, ‘Give me the highlights,’ or, ‘What do I need to follow up on?’ It really helps us be more efficient.”",
    name: "Stephanie Jones",
    role: "TBD",
  },
];

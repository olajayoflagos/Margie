// Single source of truth for room content. Used by the landing page cards,
// the individual room pages, the gallery, and the booking form so prices and
// descriptions never drift out of sync between them.
//
// NOTE: `price` here is for display and for pre-filling forms only. The
// price that is actually charged is recomputed server-side in
// functions/index.js from the matching document in the Firestore `rooms`
// collection - keep the two in sync when you change a price.
import heroImg from "../assets/Aapartment3.jpg";
import apt2 from "../assets/Aapartment5.jpg";
import roomDiamond from "../assets/Aadiamond1.jpg";
import roomEmerald from "../assets/Aaemerald1.jpg";
import roomOnyx from "../assets/Aronyx3.jpg";
import roomBronzite from "../assets/Arbronzite1.jpg";

export const rooms = [
  {
    slug: "the-apartment",
    ogImage: "/gallery/Aapartment3.jpg",
    maxGuests: 4,
    seoTagline: "Serviced 2-bedroom apartment in Gbagada, Lagos",
    id: "apartment",
    name: "The Apartment",
    img: heroImg,
    gallery: ["Aapartment1.jpg", "Aapartment2.jpg", "Aapartment3.jpg", "Aapartment4.jpg", "Aapartment5.jpg"],
    perks: ["2 Bedrooms", "City View", "Kitchenette"],
    price: 127500,
    description:
      "A roomy, city-facing apartment perfect for families or longer stays - combines privacy with a small kitchenette for light meals.",
    story:
      "This is the whole floor, not just a room - two bedrooms, a living space, and a kitchenette that turns a weekend errand run into a home-cooked breakfast. Guests who take The Apartment tend to be putting down roots for a while: a family in town for a wedding, a consultant on a six-week contract, friends who want their own doors to close at night. From the window you get Gbagada's evening rhythm rolling out below - okada horns, the smell of suya starting up, the supermarket sign blinking on across the street - close enough to feel it, high enough to sleep through it.",
  },
  {
    slug: "room-diamond",
    ogImage: "/gallery/Aadiamond1.jpg",
    maxGuests: 2,
    seoTagline: "Queen room with workspace in Gbagada, Lagos",
    id: "diamond",
    name: "Room Diamond",
    img: roomDiamond,
    gallery: ["Aadiamond1.jpg", "Aadiamond2.jpg", "Aadiamond3.jpg"],
    perks: ["Queen Bed", "Smart TV", "Workspace"],
    price: 59500,
    description:
      "Bright and comfortable, Room Diamond is ideal for business travellers who need a dedicated workspace and reliable connectivity.",
    story:
      "Diamond is built for the guest who's still working when the trip starts. The desk isn't an afterthought wedged in a corner - it's positioned for a real day of laptop meetings, with a queen bed waiting for whenever the last call ends and a Smart TV for whenever it doesn't. Named for clarity and cut precision, this room rewards guests who want their stay to run as clean as their itinerary: check in, get online, get things done, sleep well, repeat.",
  },
  {
    slug: "room-emerald",
    ogImage: "/gallery/Aaemerald1.jpg",
    maxGuests: 2,
    seoTagline: "Air-conditioned double room in Gbagada, Lagos",
    id: "emerald",
    name: "Room Emerald",
    img: roomEmerald,
    gallery: ["Aaemerald1.jpg", "Aaemerald2.jpg"],
    perks: ["Cozy Bed", "AC", "Fast Wi-Fi"],
    price: 59500,
    description:
      "A cozy, air-conditioned room with fast Wi-Fi - great for guests who want comfort without fuss.",
    story:
      "Emerald is the room for guests who came to Lagos to actually rest. There's no theme to figure out, no design flourish to admire - just cool air humming quietly, a bed you sink into, and Wi-Fi fast enough to disappear into a show or a call home. It's a favourite with returning guests who've stopped needing much beyond a door that locks, a mattress that's soft in the right places, and a room that stays exactly as calm as they left it.",
  },
  {
    slug: "room-onyx",
    ogImage: "/gallery/Aronyx3.jpg",
    maxGuests: 2,
    seoTagline: "Compact ensuite room in Gbagada, Lagos",
    id: "onyx",
    name: "Room Onyx",
    img: roomOnyx,
    gallery: ["Aronyx1.jpg", "Aronyx2.jpg", "Aronyx3.jpg", "Aronyx4.jpg"],
    perks: ["Warm Lighting", "Wardrobe", "Ensuite"],
    price: 34000,
    description:
      "Compact and well-laid-out, Room Onyx offers a private ensuite and warm lighting for a relaxed stay.",
    story:
      "Onyx proves small doesn't mean stripped-down. Every inch of it is deliberate - a wardrobe exactly where you reach for it, an ensuite that means never stepping into a hallway at 2am, and warm lighting that makes a compact room feel more like a cocoon than a compromise. It's the pick for solo travellers and short hops who want their own private corner of Gbagada without paying for square footage they'd never use.",
  },
  {
    slug: "room-bronzite",
    ogImage: "/gallery/Arbronzite1.jpg",
    maxGuests: 2,
    seoTagline: "Affordable ensuite room in Gbagada, Lagos",
    id: "bronzite",
    name: "Room Bronzite",
    img: roomBronzite,
    gallery: ["Arbronzite1.jpg", "Arbronzite2.jpg", "Arbronzite4.jpg"],
    perks: ["Budget-friendly", "Clean", "Comfortable"],
    price: 59500,
    description:
      "Budget-conscious without sacrificing quality - Bronzite is tidy, comfortable, and good value for short stays.",
    story:
      "Bronzite is the room that quietly does its job right. No frills chasing your attention, just a well-kept space with a comfortable bed and everything wiped down and in its place - the kind of room that makes a short stay easy instead of memorable for the wrong reasons. Named for a stone valued for being sturdy and unshowy, it's built for guests passing through Lagos who want good value and zero surprises.",
  },
];

export const gallery = [heroImg, apt2, roomDiamond, roomEmerald, roomOnyx, roomBronzite];

export function getRoomBySlug(slug) {
  return rooms.find((r) => r.slug === slug);
}

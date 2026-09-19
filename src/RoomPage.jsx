import { useNavigate, useParams, Link } from "react-router-dom";
import Seo from "./seo/Seo";
import { hotelRoomSchema, breadcrumbSchema, lodgingBusinessSchema } from "./seo/schema";
import { getRoomBySlug, rooms } from "./data/rooms";
import "./RoomPage.css";

const naira = (n) => `₦${Number(n || 0).toLocaleString("en-NG")}`;

export default function RoomPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const room = getRoomBySlug(slug);

  if (!room) {
    return (
      <main className="page page--center">
        <Seo
          title="Room not found | Margie's"
          description="This room page could not be found."
          path={`/rooms/${slug || ""}`}
          noindex
        />
        <h1>Room not found</h1>
        <p>
          <Link to="/">Back to home</Link>
        </p>
      </main>
    );
  }

  const path = `/rooms/${room.slug}`;
  const otherRooms = rooms.filter((r) => r.slug !== room.slug);

  // Written for humans first, but deliberately carries the words people
  // actually search for: the room name, "Gbagada", "Lagos", and the price.
  const metaTitle = `${room.name} - ${room.seoTagline || "Gbagada, Lagos"} | Margie's`;
  const metaDescription = `${room.description} Sleeps up to ${room.maxGuests || 2}. From ${naira(
    room.price
  )} per night at Margie's, Gbagada, Lagos. Book online instantly.`;

  return (
    <main className="room-page">
      <Seo
        title={metaTitle}
        description={metaDescription}
        path={path}
        image={room.ogImage || room.img}
        schema={[
          hotelRoomSchema(room, path),
          lodgingBusinessSchema(),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Rooms", path: "/#rooms" },
            { name: room.name, path },
          ]),
        ]}
      />

      <nav className="breadcrumbs container" aria-label="Breadcrumb">
        <Link to="/">Home</Link> <span aria-hidden="true">/</span>{" "}
        <span aria-current="page">{room.name}</span>
      </nav>

      <section className="room-hero">
        <img
          src={room.img}
          alt={`${room.name} at Margie's, Gbagada Lagos`}
          className="room-hero__img"
          width="1200"
          height="675"
          fetchPriority="high"
        />
        <div className="room-hero__overlay" />
        <div className="container room-hero__content">
          <h1>
            {room.name} <span className="room-hero__tagline">{room.seoTagline}</span>
          </h1>
          <p className="room-hero__price">{naira(room.price)} / night</p>
        </div>
      </section>

      <section className="container room-body">
        <p className="room-description">{room.description}</p>

        {room.story && (
          <div className="room-story">
            <h2>The story of {room.name}</h2>
            <p>{room.story}</p>
          </div>
        )}

        <h2>What&apos;s included</h2>
        <ul className="room-perks">
          {room.perks.map((perk) => (
            <li key={perk}>{perk}</li>
          ))}
        </ul>
        <p className="room-occupancy">Sleeps up to {room.maxGuests || 2} guests.</p>

        <h2>Photos of {room.name}</h2>
        <div className="room-gallery">
          {room.gallery.map((img, i) => (
            <img
              key={i}
              src={`/gallery/${img}`}
              alt={`${room.name} at Margie's Gbagada - photo ${i + 1}`}
              loading="lazy"
              width="600"
              height="400"
            />
          ))}
        </div>

        <button
          className="btn btn--primary room-cta"
          onClick={() => navigate("/check", { state: { preselectedRoomId: room.id } })}
        >
          Check availability &amp; book {room.name}
        </button>
      </section>

      <section className="container other-rooms">
        <h2>Other rooms at Margie&apos;s</h2>
        <div className="other-rooms__grid">
          {otherRooms.map((r) => (
            <Link to={`/rooms/${r.slug}`} key={r.slug} className="other-rooms__card">
              <img src={r.img} alt={`${r.name} at Margie's, Gbagada Lagos`} loading="lazy" />
              <span>{r.name}</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

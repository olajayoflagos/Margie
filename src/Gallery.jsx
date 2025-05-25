import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import "./Gallery.css";

const roomSections = [
  {
    title: "The Apartment",
    note: "The Apartment comes with Diamond Room and Emerald Room",
    images: ["Aapartment1.jpg", "Aapartment2.jpg", "Aapartment3.jpg", "Aapartment4.jpg", "Aapartment5.jpg"],
  },
  {
    title: "Diamond Room",
    images: ["Aadiamond1.jpg", "Aadiamond2.jpg", "Aadiamond3.jpg"],
  },
  {
    title: "Emerald Room",
    images: ["Aaemerald1.jpg", "Aaemerald2.jpg"],
  },
  {
    title: "Onyx Room",
    images: ["Aronyx1.jpg", "Aronyx2.jpg", "Aronyx3.jpg", "Aronyx4.jpg"],
  },
  {
    title: "Bronzite Room",
    images: ["Arbronzite1.jpg", "Arbronzite2.jpg", "Arbronzite4.jpg"],
  },
];

const Gallery = () => {
  const location = useLocation();
  const sectionRefs = useRef({});

  useEffect(() => {
    const roomKey = location.state?.roomKey;
    if (roomKey) {
      for (const section of roomSections) {
        if (section.title.toLowerCase().includes(roomKey.toLowerCase()) ||
            section.images.some(img => img.toLowerCase().includes(roomKey.toLowerCase()))) {
          const sectionRef = sectionRefs.current[section.title];
          if (sectionRef && sectionRef.scrollIntoView) {
            sectionRef.scrollIntoView({ behavior: "smooth", block: "start" });
            break;
          }
        }
      }
    }
  }, [location.state]);

  return (
    <div className="gallery-container">
      <h1>Gallery</h1>
      {roomSections.map((room, index) => (
        <div
          key={index}
          className="room-section"
          ref={(el) => (sectionRefs.current[room.title] = el)}
        >
          <h2>{room.title}</h2>
          {room.note && <p className="room-note">{room.note}</p>}
          <div className="room-images">
            {room.images.map((img, i) => (
              <img key={i} src={`/gallery/${img}`} alt={`${room.title} ${i + 1}`} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Gallery;

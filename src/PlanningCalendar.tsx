import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventInput } from '@fullcalendar/core';
import { EventApi } from '@fullcalendar/core'; // ✅ important pour typer les événements cliqués

const PlanningCalendar: React.FC = () => {
  const [events, setEvents] = useState<EventInput[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventApi | null>(null); // ✅ corrigé ici
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetch('https://cors-anywhere.herokuapp.com/https://crmplanning.azurewebsites.net/api/GetPlanning')
      .then((response) => response.json())
      .then((data) => {
        const formattedEvents: EventInput[] = data.map((item: any) => {
          const startDate = new Date(item.planningVisite_DateVisite);
          const endDate = new Date(item.planningVisite_DateFin);

          const startHour = startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const endHour = endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          return {
            title: `${startHour} - ${endHour}\n${item.planningVisite_username}\n(${item.planningNatureVisite})`,
            start: item.planningVisite_DateVisite,
            end: item.planningVisite_DateFin,
            color: item.planningVisite_Color,
            allDay: false,
          };
        });

        setEvents(formattedEvents);
      })
      .catch((error) => console.error('Erreur lors de la récupération du planning :', error));
  }, []);

  return (
    <div className="calendar-wrapper">
      <h2 className="calendar-title">Planning des visites</h2>
      <div className="calendar-shell" style={{ padding: '0 40px 40px', maxWidth: '1200px', margin: '0 auto' }}>
        <FullCalendar
          eventClick={(info) => {
            setSelectedEvent(info.event); // ✅ corrigé ici
            setIsModalOpen(true);
          }}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          events={events}
          height="auto"
          slotMinTime="08:00:00"
          slotMaxTime="23:30:00"
          slotDuration="00:15:00"
          slotLabelFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }}
          eventContent={(arg) => {
            const lines = arg.event.title?.split('\n') || [];
            return (
              <div style={{ whiteSpace: 'normal', fontSize: '0.85em', lineHeight: '1.3' }}>
                <strong>{lines[0]}</strong><br />
                <span>{lines[1]}</span><br />
                <em>{lines[2]}</em>
              </div>
            );
          }}
        />

        {isModalOpen && selectedEvent && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Détails du rendez-vous</h3>
              {selectedEvent.title ? (
                <>
                  <p><strong>Client :</strong> {selectedEvent.title.split('\n')[1]}</p>
                  <p><strong>Nature :</strong> {selectedEvent.title.split('\n')[2]}</p>
                  <p><strong>Heure :</strong> {selectedEvent.title.split('\n')[0]}</p>
                </>
              ) : (
                <p>Aucun titre renseigné.</p>
              )}
              <p><strong>Début :</strong> {selectedEvent.start?.toLocaleString()}</p>
              <p><strong>Fin :</strong> {selectedEvent.end?.toLocaleString()}</p>

              <button onClick={() => setIsModalOpen(false)}>Fermer</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanningCalendar;

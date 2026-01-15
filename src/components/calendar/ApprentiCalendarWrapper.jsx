"use client";

import { useState, useEffect } from "react";
import CalendarManagement from "./CalendarManagement";

export default function ApprentiCalendarWrapper({ userId, userRole }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Charger les événements
  const loadEvents = async () => {
    try {
      const response = await fetch("/api/calendar");
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error("Erreur chargement événements:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
    // Actualiser les événements toutes les 10 secondes pour la synchronisation en temps réel
    const interval = setInterval(loadEvents, 10000);
    return () => clearInterval(interval);
  }, []);

  // Ajouter un événement
  const handleAddEvent = async (eventData) => {
    try {
      console.log("📤 Envoi événement:", eventData);
      
      const response = await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      });

      const data = await response.json();
      console.log("📥 Réponse serveur:", response.status, data);

      if (response.ok) {
        setEvents([...events, data]);
        alert("✅ Événement créé avec succès");
      } else {
        const errorMsg = data.error || "Erreur lors de la création";
        alert(`❌ ${errorMsg}`);
        console.error("Erreur:", data);
      }
    } catch (error) {
      alert(`❌ Impossible de créer l'événement: ${error.message}`);
      console.error("Erreur complète:", error);
    }
  };

  // Supprimer un événement
  const handleDeleteEvent = async (eventId) => {
    try {
      const response = await fetch(`/api/calendar?id=${eventId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setEvents(events.filter(e => e.id !== eventId));
        alert("Événement supprimé avec succès"); // Remplace toast temporairement
      } else {
        throw new Error("Erreur lors de la suppression");
      }
    } catch (error) {
      alert("Impossible de supprimer l'événement"); // Remplace toast temporairement
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <CalendarManagement
      events={events}
      onAddEvent={handleAddEvent}
      onDeleteEvent={handleDeleteEvent}
      userRole={userRole}
    />
  );
}
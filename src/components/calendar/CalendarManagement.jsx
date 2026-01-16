"use client";

import { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Plus, Calendar, Clock, MapPin, Trash2 } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from "date-fns";
import { fr } from "date-fns/locale";

const EVENT_TYPES = {
  SOUTENANCE: { label: "Soutenance", color: "bg-purple-500" },
  ENTRETIEN: { label: "Entretien", color: "bg-blue-500" },
  REUNION: { label: "Réunion", color: "bg-green-500" },
  FORMATION: { label: "Formation", color: "bg-orange-500" },
  VISITE_ENTREPRISE: { label: "Visite entreprise", color: "bg-pink-500" },
  AUTRE: { label: "Autre", color: "bg-gray-500" },
};

export default function CalendarManagement({ events = [], onAddEvent, onDeleteEvent, userRole = "APPRENTI" }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState("month"); // month or list
  
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    type: "ENTRETIEN",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    location: "",
  });

  // Calculer les jours du mois
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Organiser les événements par date
  const eventsByDate = useMemo(() => {
    const map = new Map();
    events.forEach(event => {
      const dateKey = format(new Date(event.startDate), 'yyyy-MM-dd');
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey).push(event);
    });
    return map;
  }, [events]);

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const handleToday = () => setCurrentDate(new Date());

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const eventData = {
      ...newEvent,
      startDate: new Date(`${newEvent.startDate}T${newEvent.startTime || '00:00'}`),
      endDate: new Date(`${newEvent.endDate || newEvent.startDate}T${newEvent.endTime || '23:59'}`),
    };

    await onAddEvent(eventData);
    
    setNewEvent({
      title: "",
      description: "",
      type: "ENTRETIEN",
      startDate: "",
      startTime: "",
      endDate: "",
      endTime: "",
      location: "",
    });
    setIsDialogOpen(false);
  };

  const eventsForSelectedDate = selectedDate 
    ? eventsByDate.get(format(selectedDate, 'yyyy-MM-dd')) || []
    : [];

  const upcomingEvents = events
    .filter(e => new Date(e.startDate) >= new Date())
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant={viewMode === "month" ? "default" : "outline"}
            onClick={() => setViewMode("month")}
            size="sm"
          >
            Calendrier
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            onClick={() => setViewMode("list")}
            size="sm"
          >
            Liste
          </Button>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Nouvel événement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Créer un nouvel événement</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Titre *</Label>
                <Input
                  id="title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  required
                  placeholder="Ex: Soutenance projet final"
                />
              </div>

              <div>
                <Label htmlFor="type">Type d'événement *</Label>
                <Select
                  value={newEvent.type}
                  onValueChange={(value) => setNewEvent({ ...newEvent, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(EVENT_TYPES).map(([key, { label }]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Date de début *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={newEvent.startDate}
                    onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="startTime">Heure de début</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={newEvent.startTime}
                    onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="endDate">Date de fin</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={newEvent.endDate}
                    onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">Heure de fin</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={newEvent.endTime}
                    onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location">Lieu</Label>
                <Input
                  id="location"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  placeholder="Ex: Salle 205, Bâtiment A"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="Détails supplémentaires..."
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Créer l'événement
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {viewMode === "month" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendrier */}
          <Card className="lg:col-span-2 rounded-3xl border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg">
                {format(currentDate, 'MMMM yyyy', { locale: fr })}
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handlePrevMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleToday}>
                  Aujourd'hui
                </Button>
                <Button variant="outline" size="sm" onClick={handleNextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* En-têtes des jours */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
                  <div key={day} className="text-center text-xs font-semibold text-slate-600 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Grille du calendrier */}
              <div className="grid grid-cols-7 gap-2">
                {/* Jours vides au début */}
                {Array.from({ length: (monthStart.getDay() + 6) % 7 }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}

                {/* Jours du mois */}
                {daysInMonth.map(day => {
                  const dateKey = format(day, 'yyyy-MM-dd');
                  const dayEvents = eventsByDate.get(dateKey) || [];
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  const isCurrentDay = isToday(day);

                  return (
                    <button
                      key={dateKey}
                      onClick={() => setSelectedDate(day)}
                      className={`
                        aspect-square rounded-lg p-1 text-sm transition-all
                        ${isCurrentDay ? 'bg-blue-100 font-bold' : 'hover:bg-slate-100'}
                        ${isSelected ? 'ring-2 ring-blue-500' : ''}
                        ${!isSameMonth(day, currentDate) ? 'text-slate-300' : 'text-slate-900'}
                      `}
                    >
                      <div className="flex flex-col h-full">
                        <span className="text-xs">{format(day, 'd')}</span>
                        <div className="flex-1 flex flex-col gap-0.5 mt-1">
                          {dayEvents.slice(0, 2).map((event, i) => (
                            <div
                              key={event.id}
                              className={`h-1 rounded ${EVENT_TYPES[event.type]?.color || 'bg-gray-400'}`}
                            />
                          ))}
                          {dayEvents.length > 2 && (
                            <span className="text-[8px] text-slate-500">+{dayEvents.length - 2}</span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Événements du jour sélectionné */}
          <Card className="rounded-3xl border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">
                {selectedDate 
                  ? format(selectedDate, 'd MMMM yyyy', { locale: fr })
                  : 'Événements à venir'
                }
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(selectedDate ? eventsForSelectedDate : upcomingEvents).length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-8">
                    {selectedDate ? 'Aucun événement ce jour' : 'Aucun événement à venir'}
                  </p>
                )}

                {(selectedDate ? eventsForSelectedDate : upcomingEvents).map(event => (
                  <div
                    key={event.id}
                    className="rounded-xl border border-slate-200 p-4 space-y-2 hover:bg-slate-50 transition"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={`${EVENT_TYPES[event.type]?.color} text-white text-xs`}>
                            {EVENT_TYPES[event.type]?.label}
                          </Badge>
                        </div>
                        <h4 className="font-semibold text-sm text-slate-900">{event.title}</h4>
                      </div>
                      {(userRole === "MA" || userRole === "TP" || userRole === "APPRENTI") && onDeleteEvent && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteEvent(event.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="space-y-1 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        <span>
                          {format(new Date(event.startDate), 'HH:mm', { locale: fr })}
                          {event.endDate && ` - ${format(new Date(event.endDate), 'HH:mm', { locale: fr })}`}
                        </span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>

                    {event.description && (
                      <p className="text-xs text-slate-600 mt-2">{event.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Vue liste */
        <Card className="rounded-3xl border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Tous les événements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {events.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-8">
                  Aucun événement programmé
                </p>
              )}

              {events
                .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
                .map(event => (
                  <div
                    key={event.id}
                    className="rounded-xl border border-slate-200 p-5 space-y-3 hover:bg-slate-50 transition"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={`${EVENT_TYPES[event.type]?.color} text-white text-xs`}>
                            {EVENT_TYPES[event.type]?.label}
                          </Badge>
                          <span className="text-xs text-slate-500">
                            {format(new Date(event.startDate), 'd MMMM yyyy', { locale: fr })}
                          </span>
                        </div>
                        <h4 className="font-semibold text-base text-slate-900">{event.title}</h4>
                      </div>
                      {(userRole === "MA" || userRole === "TP" || userRole === "APPRENTI") && onDeleteEvent && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteEvent(event.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>
                          {format(new Date(event.startDate), 'HH:mm', { locale: fr })}
                          {event.endDate && ` - ${format(new Date(event.endDate), 'HH:mm', { locale: fr })}`}
                        </span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>

                    {event.description && (
                      <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">
                        {event.description}
                      </p>
                    )}
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
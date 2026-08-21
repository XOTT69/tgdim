"use client";
import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { events } from "@/lib/demo-data";
export default function EventsPage() { const [joined, setJoined] = useState(false); const event = events[0]; return <><PageHeader title="Події" /><article className="card"><p className="text-xs font-semibold text-blue-600">{event.date}</p><h2 className="mt-2 text-lg font-semibold">{event.title}</h2><p className="mt-2 text-sm text-slate-600">Зробимо наш двір чистішим разом. Рукавички та пакети будуть на місці.</p><p className="mt-3 text-sm">📍 {event.location}</p><button onClick={() => setJoined(!joined)} className="primary-button mt-4 w-full">{joined ? "✓ Ви берете участь" : "Я беру участь"}</button><p className="mt-3 text-center text-xs text-slate-400">{event.attendees + (joined ? 1 : 0)} учасників</p></article></>; }

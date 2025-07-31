"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Filter, Eye, Calendar, Plus, Edit, Trash2, MapPin, Users, Clock } from "lucide-react";

// Event Status Types
type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

// Event Interface
interface Event {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: string;
  maxParticipants: number;
  currentParticipants: number;
  price: number;
  status: EventStatus;
  category: string;
  image: string;
  organizer: {
    name: string;
    email: string;
    phone: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Mock Data
const mockEvents: Event[] = [
  {
    id: "1",
    title: "2024 봄 패션 쇼",
    description: "최신 봄 패션 트렌드를 소개하는 패션쇼입니다.",
    startDate: new Date("2024-03-15T14:00:00"),
    endDate: new Date("2024-03-15T18:00:00"),
    location: "서울 패션센터",
    maxParticipants: 200,
    currentParticipants: 150,
    price: 50000,
    status: "upcoming",
    category: "패션",
    image: "https://via.placeholder.com/300x200",
    organizer: {
      name: "김패션",
      email: "fashion@email.com",
      phone: "010-1234-5678"
    },
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-15")
  },
  {
    id: "2",
    title: "디지털 마케팅 워크샵",
    description: "소셜미디어 마케팅 전략과 실전 팁을 공유합니다.",
    startDate: new Date("2024-02-20T10:00:00"),
    endDate: new Date("2024-02-20T17:00:00"),
    location: "강남 비즈니스센터",
    maxParticipants: 50,
    currentParticipants: 45,
    price: 150000,
    status: "ongoing",
    category: "교육",
    image: "https://via.placeholder.com/300x200",
    organizer: {
      name: "이마케팅",
      email: "marketing@email.com",
      phone: "010-2345-6789"
    },
    createdAt: new Date("2024-01-05"),
    updatedAt: new Date("2024-02-20")
  },
  {
    id: "3",
    title: "음식 페스티벌",
    description: "다양한 음식과 음료를 즐길 수 있는 페스티벌입니다.",
    startDate: new Date("2024-01-25T12:00:00"),
    endDate: new Date("2024-01-25T22:00:00"),
    location: "한강공원",
    maxParticipants: 500,
    currentParticipants: 480,
    price: 30000,
    status: "completed",
    category: "음식",
    image: "https://via.placeholder.com/300x200",
    organizer: {
      name: "박푸드",
      email: "food@email.com",
      phone: "010-3456-7890"
    },
    createdAt: new Date("2023-12-20"),
    updatedAt: new Date("2024-01-25")
  },
  {
    id: "4",
    title: "테크 컨퍼런스",
    description: "최신 기술 트렌드와 혁신 아이디어를 공유합니다.",
    startDate: new Date("2024-04-10T09:00:00"),
    endDate: new Date("2024-04-12T18:00:00"),
    location: "코엑스 그랜드볼룸",
    maxParticipants: 1000,
    currentParticipants: 0,
    price: 200000,
    status: "upcoming",
    category: "기술",
    image: "https://via.placeholder.com/300x200",
    organizer: {
      name: "최테크",
      email: "tech@email.com",
      phone: "010-4567-8901"
    },
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15")
  },
  {
    id: "5",
    title: "요가 클래스",
    description: "초보자를 위한 기초 요가 클래스입니다.",
    startDate: new Date("2024-02-10T19:00:00"),
    endDate: new Date("2024-02-10T20:30:00"),
    location: "요가스튜디오",
    maxParticipants: 20,
    currentParticipants: 0,
    price: 25000,
    status: "cancelled",
    category: "건강",
    image: "https://via.placeholder.com/300x200",
    organizer: {
      name: "정요가",
      email: "yoga@email.com",
      phone: "010-5678-9012"
    },
    createdAt: new Date("2024-01-08"),
    updatedAt: new Date("2024-02-05")
  }
];

// Status Badge Component
const StatusBadge = ({ status }: { status: EventStatus }) => {
  const statusConfig = {
    upcoming: { label: "예정", color: "bg-blue-100 text-blue-800" },
    ongoing: { label: "진행중", color: "bg-green-100 text-green-800" },
    completed: { label: "완료", color: "bg-gray-100 text-gray-800" },
    cancelled: { label: "취소", color: "bg-red-100 text-red-800" }
  };

  const config = statusConfig[status];
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
      {config.label}
    </span>
  );
};

// Event Detail Modal Component
const EventDetailModal = ({ event, isOpen, onClose }: {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">이벤트 상세</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <Trash2 className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Event Image */}
          <div className="w-full h-48 bg-gray-200 rounded-lg overflow-hidden">
            <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
          </div>

          {/* Event Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  이벤트 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p><strong>제목:</strong> {event.title}</p>
                <p><strong>카테고리:</strong> {event.category}</p>
                <p><strong>상태:</strong> <StatusBadge status={event.status} /></p>
                <p><strong>가격:</strong> {event.price.toLocaleString('ko-KR')}원</p>
                <p><strong>설명:</strong> {event.description}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  일정 및 장소
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p><strong>시작일:</strong> {event.startDate.toLocaleDateString('ko-KR')} {event.startDate.toLocaleTimeString('ko-KR')}</p>
                <p><strong>종료일:</strong> {event.endDate.toLocaleDateString('ko-KR')} {event.endDate.toLocaleTimeString('ko-KR')}</p>
                <p><strong>장소:</strong> {event.location}</p>
                <p><strong>참가자:</strong> {event.currentParticipants}/{event.maxParticipants}명</p>
              </CardContent>
            </Card>
          </div>

          {/* Organizer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                주최자 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><strong>이름:</strong> {event.organizer.name}</p>
              <p><strong>이메일:</strong> {event.organizer.email}</p>
              <p><strong>전화번호:</strong> {event.organizer.phone}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<EventStatus | "">("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter events
  const filteredEvents = events.filter(event => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.organizer.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "" || event.status === statusFilter;
    const matchesCategory = categoryFilter === "" || event.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Delete event
  const handleDeleteEvent = (eventId: string) => {
    if (confirm("이 이벤트를 삭제하시겠습니까?")) {
      setEvents(prev => prev.filter(event => event.id !== eventId));
    }
  };

  // Open event detail modal
  const openEventDetail = (event: Event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">이벤트 관리</h1>
          <p className="text-sm text-gray-600">모든 이벤트를 확인하고 관리하세요</p>
        </div>
        <div className="flex items-center gap-2">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            새 이벤트
          </Button>
          <span className="text-sm text-gray-600">
            총: {filteredEvents.length}개 이벤트
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="이벤트 제목, 설명, 주최자로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">필터:</span>
          </div>

          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value as EventStatus | "")}
            className="border rounded-lg px-3 py-2"
          >
            <option value="">모든 상태</option>
            <option value="upcoming">예정</option>
            <option value="ongoing">진행중</option>
            <option value="completed">완료</option>
            <option value="cancelled">취소</option>
          </select>

          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            <option value="">모든 카테고리</option>
            <option value="패션">패션</option>
            <option value="교육">교육</option>
            <option value="음식">음식</option>
            <option value="기술">기술</option>
            <option value="건강">건강</option>
          </select>

          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("");
              setCategoryFilter("");
            }}
            className="bg-white text-black border border-gray-300 hover:bg-gray-50"
          >
            필터 초기화
          </Button>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => (
          <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-48 bg-gray-200 overflow-hidden">
              <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
            </div>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">{event.title}</h3>
                <StatusBadge status={event.status} />
              </div>
              
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{event.description}</p>
              
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{event.startDate.toLocaleDateString('ko-KR')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{event.currentParticipants}/{event.maxParticipants}명</span>
                </div>
                <div className="font-medium text-gray-900">
                  {event.price.toLocaleString('ko-KR')}원
                </div>
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEventDetail(event)}
                  className="flex-1 bg-white text-black border border-gray-300 hover:bg-gray-50"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  상세
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white text-blue-600 border border-blue-300 hover:bg-blue-50"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteEvent(event.id)}
                  className="bg-white text-red-600 border border-red-300 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredEvents.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              이벤트를 찾을 수 없습니다
            </h3>
            <p className="text-gray-500">
              필터나 검색어를 변경해보세요
            </p>
          </CardContent>
        </Card>
      )}

      {/* Event Detail Modal */}
      <EventDetailModal
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEvent(null);
        }}
      />
    </div>
  );
}

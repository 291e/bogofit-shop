"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Users, DollarSign, Image, Clock, User, Package } from "lucide-react";

export default function CreateEventPage() {
  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    category: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    location: "",
    maxParticipants: "",
    price: "",
    image: "",
    organizer: {
      name: "",
      email: "",
      phone: ""
    }
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const categories = [
    "패션", "교육", "음식", "기술", "건강", "음악", "스포츠", "예술", "비즈니스", "기타"
  ];

  const handleInputChange = (field: string, value: string) => {
    setEventData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const handleOrganizerChange = (field: string, value: string) => {
    setEventData(prev => ({
      ...prev,
      organizer: {
        ...prev.organizer,
        [field]: value
      }
    }));
    
    if (errors[`organizer.${field}`]) {
      setErrors(prev => ({
        ...prev,
        [`organizer.${field}`]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!eventData.title.trim()) {
      newErrors.title = "이벤트 제목을 입력해주세요";
    }

    if (!eventData.description.trim()) {
      newErrors.description = "이벤트 설명을 입력해주세요";
    }

    if (!eventData.category) {
      newErrors.category = "카테고리를 선택해주세요";
    }

    if (!eventData.startDate) {
      newErrors.startDate = "시작일을 선택해주세요";
    }

    if (!eventData.startTime) {
      newErrors.startTime = "시작 시간을 선택해주세요";
    }

    if (!eventData.endDate) {
      newErrors.endDate = "종료일을 선택해주세요";
    }

    if (!eventData.endTime) {
      newErrors.endTime = "종료 시간을 선택해주세요";
    }

    if (!eventData.location.trim()) {
      newErrors.location = "장소를 입력해주세요";
    }

    if (!eventData.maxParticipants || parseInt(eventData.maxParticipants) <= 0) {
      newErrors.maxParticipants = "유효한 최대 참가자 수를 입력해주세요";
    }

    if (!eventData.price || parseInt(eventData.price) < 0) {
      newErrors.price = "유효한 가격을 입력해주세요";
    }

    if (!eventData.organizer.name.trim()) {
      newErrors["organizer.name"] = "주최자 이름을 입력해주세요";
    }

    if (!eventData.organizer.email.trim()) {
      newErrors["organizer.email"] = "주최자 이메일을 입력해주세요";
    }

    if (!eventData.organizer.phone.trim()) {
      newErrors["organizer.phone"] = "주최자 전화번호를 입력해주세요";
    }

    // Date validation
    if (eventData.startDate && eventData.endDate) {
      const startDate = new Date(`${eventData.startDate}T${eventData.startTime}`);
      const endDate = new Date(`${eventData.endDate}T${eventData.endTime}`);
      
      if (startDate >= endDate) {
        newErrors.endDate = "종료일은 시작일보다 늦어야 합니다";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      console.log("새 이벤트:", eventData);
      alert("이벤트가 성공적으로 등록되었습니다!");
      
      // Reset form
      setEventData({
        title: "",
        description: "",
        category: "",
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: "",
        location: "",
        maxParticipants: "",
        price: "",
        image: "",
        organizer: {
          name: "",
          email: "",
          phone: ""
        }
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">새 이벤트 등록</h1>
          <p className="text-sm text-gray-600">이벤트 정보를 입력하여 새로운 이벤트를 등록하세요</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 기본 정보 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              기본 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">이벤트 제목 *</Label>
              <Input
                id="title"
                value={eventData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="이벤트 제목을 입력하세요"
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>

            <div>
              <Label htmlFor="description">이벤트 설명 *</Label>
              <Textarea
                id="description"
                value={eventData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="이벤트에 대한 상세한 설명을 입력하세요"
                rows={4}
                className={errors.description ? "border-red-500" : ""}
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            <div>
              <Label htmlFor="category">카테고리 *</Label>
              <select
                id="category"
                value={eventData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 mt-1 ${errors.category ? "border-red-500" : ""}`}
              >
                <option value="">카테고리를 선택하세요</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
            </div>

            <div>
              <Label htmlFor="image">이벤트 이미지 URL</Label>
              <Input
                id="image"
                type="url"
                value={eventData.image}
                onChange={(e) => handleInputChange("image", e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </CardContent>
        </Card>

        {/* 일정 및 장소 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              일정 및 장소
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">시작일 *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={eventData.startDate}
                  onChange={(e) => handleInputChange("startDate", e.target.value)}
                  className={errors.startDate ? "border-red-500" : ""}
                />
                {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
              </div>

              <div>
                <Label htmlFor="startTime">시작 시간 *</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={eventData.startTime}
                  onChange={(e) => handleInputChange("startTime", e.target.value)}
                  className={errors.startTime ? "border-red-500" : ""}
                />
                {errors.startTime && <p className="text-red-500 text-sm mt-1">{errors.startTime}</p>}
              </div>

              <div>
                <Label htmlFor="endDate">종료일 *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={eventData.endDate}
                  onChange={(e) => handleInputChange("endDate", e.target.value)}
                  className={errors.endDate ? "border-red-500" : ""}
                />
                {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
              </div>

              <div>
                <Label htmlFor="endTime">종료 시간 *</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={eventData.endTime}
                  onChange={(e) => handleInputChange("endTime", e.target.value)}
                  className={errors.endTime ? "border-red-500" : ""}
                />
                {errors.endTime && <p className="text-red-500 text-sm mt-1">{errors.endTime}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="location">장소 *</Label>
              <Input
                id="location"
                value={eventData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="이벤트가 진행될 장소를 입력하세요"
                className={errors.location ? "border-red-500" : ""}
              />
              {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
            </div>
          </CardContent>
        </Card>

        {/* 참가자 및 가격 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              참가자 및 가격
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maxParticipants">최대 참가자 수 *</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  min="1"
                  value={eventData.maxParticipants}
                  onChange={(e) => handleInputChange("maxParticipants", e.target.value)}
                  placeholder="예: 100"
                  className={errors.maxParticipants ? "border-red-500" : ""}
                />
                {errors.maxParticipants && <p className="text-red-500 text-sm mt-1">{errors.maxParticipants}</p>}
              </div>

              <div>
                <Label htmlFor="price">참가비 (원) *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  value={eventData.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  placeholder="예: 50000"
                  className={errors.price ? "border-red-500" : ""}
                />
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 주최자 정보 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-orange-600" />
              주최자 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="organizerName">주최자 이름 *</Label>
              <Input
                id="organizerName"
                value={eventData.organizer.name}
                onChange={(e) => handleOrganizerChange("name", e.target.value)}
                placeholder="주최자 이름을 입력하세요"
                className={errors["organizer.name"] ? "border-red-500" : ""}
              />
              {errors["organizer.name"] && <p className="text-red-500 text-sm mt-1">{errors["organizer.name"]}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="organizerEmail">이메일 *</Label>
                <Input
                  id="organizerEmail"
                  type="email"
                  value={eventData.organizer.email}
                  onChange={(e) => handleOrganizerChange("email", e.target.value)}
                  placeholder="example@email.com"
                  className={errors["organizer.email"] ? "border-red-500" : ""}
                />
                {errors["organizer.email"] && <p className="text-red-500 text-sm mt-1">{errors["organizer.email"]}</p>}
              </div>

              <div>
                <Label htmlFor="organizerPhone">전화번호 *</Label>
                <Input
                  id="organizerPhone"
                  value={eventData.organizer.phone}
                  onChange={(e) => handleOrganizerChange("phone", e.target.value)}
                  placeholder="010-1234-5678"
                  className={errors["organizer.phone"] ? "border-red-500" : ""}
                />
                {errors["organizer.phone"] && <p className="text-red-500 text-sm mt-1">{errors["organizer.phone"]}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 제출 버튼 */}
        <div className="flex justify-center pt-6">
          <Button 
            type="submit" 
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
          >
            이벤트 등록
          </Button>
        </div>
      </form>
    </div>
  );
} 
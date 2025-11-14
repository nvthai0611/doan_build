"use client"

import { GraduationCap, Mail, Phone, MapPin, Facebook, Youtube, Music } from "lucide-react"
import type { CenterInfo } from "../../../services/common/public-center-info.service"

interface FooterProps {
  centerInfo?: CenterInfo | null
}

export const Footer = ({ centerInfo }: FooterProps) => {
  const centerName = centerInfo?.value?.centerInfo?.name || "Trung Tâm Giáo Dục"
  const centerDescription = centerInfo?.value?.centerInfo?.description || "Nơi khơi nguồn tri thức, nuôi dưỡng tương lai của thế hệ trẻ."
  const phone = centerInfo?.value?.contact?.phone || "1900 1234"
  const email = centerInfo?.value?.contact?.email || "info@center.edu"
  const address = centerInfo?.value?.address
    ? `${centerInfo.value.address.detail || ""} ${centerInfo.value.address.street || ""}`.trim() || "123 Đường ABC, TP. HCM"
    : "123 Đường ABC, TP. HCM"
  return (
    <footer className="gradient-bg text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              {centerInfo?.value?.centerInfo?.logo ? (
                <img
                  src={centerInfo.value.centerInfo.logo}
                  alt={centerName}
                  className="h-10 w-auto bg-white/20 p-1 rounded-lg"
                />
              ) : (
                <div className="bg-white/20 p-2 rounded-lg">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
              )}
              <span className="font-bold text-lg">{centerName}</span>
            </div>
            <p className="text-sm opacity-90">{centerDescription}</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Liên Kết Nhanh</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#"
                  className="opacity-90 hover:opacity-100 transition-opacity"
                >
                  Về Chúng Tôi
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="opacity-90 hover:opacity-100 transition-opacity"
                >
                  Lớp Học
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="opacity-90 hover:opacity-100 transition-opacity"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="opacity-90 hover:opacity-100 transition-opacity"
                >
                  Liên Hệ
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Liên Hệ</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>{phone}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>{email}</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5" />
                <span>{address}</span>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-semibold mb-4">Theo Dõi</h3>
            <div className="flex gap-4">
              <a
                href={centerInfo?.value?.contact?.facebook || '#'}
                className="opacity-90 hover:opacity-100 transition-opacity"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href={centerInfo?.value?.contact?.youtube || '#'}
                className="opacity-90 hover:opacity-100 transition-opacity"
              >
                <Youtube className="w-5 h-5" />
              </a>
              <a
                href={centerInfo?.value?.contact?.tiktok || '#'}
                className="opacity-90 hover:opacity-100 transition-opacity"
              >
                <Music className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 pt-8 text-center text-sm opacity-90">
          <p>&copy; 2025 {centerName}. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
}

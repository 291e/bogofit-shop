"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import VirtualFitting from "@/components/(Public)/solution/fashion/VirtualFitting";
import ItemFitting from "@/components/(Public)/solution/fashion/ItemFitting";
import HairFitting from "@/components/(Public)/solution/fashion/HairFitting";
import DyeingFitting from "@/components/(Public)/solution/fashion/DyeingFiiting";
import LipstickFitting from "@/components/(Public)/solution/fashion/LipstickFitting";
import { Sparkles } from "lucide-react";
import { useLanguage } from "@/providers/languageProvider";

export default function AIGeneratePage() {
  const { t } = useLanguage();
  const [fashionSolutionType, setFashionSolutionType] = useState<"virtual-fitting" | "item-fitting" | "hair-fitting" | "dyeing-fitting" | "lipstick-fitting" | null>(null);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t("ui.solution.title")}</h1>
            <p className="text-gray-600 mt-1">{t("ui.solution.description")}</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t("ui.solution.fashion.title")}</CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                {t("ui.solution.fashion.description")}
              </p>
            </div>
            {fashionSolutionType && (
              <Button
                variant="outline"
                onClick={() => setFashionSolutionType(null)}
                className="text-sm"
              >
                {t("ui.solution.back") || "Back"}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!fashionSolutionType ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mt-4">
              <div
                className="cursor-pointer group relative overflow-hidden rounded-xl border-2 border-gray-100 hover:border-pink-500 transition-all duration-300 bg-white p-6 shadow-sm hover:shadow-md"
                onClick={() => setFashionSolutionType("virtual-fitting")}
              >
                <div className="aspect-video relative mb-4 bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-12 h-12 text-pink-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {t("ui.solution.fashion.virtualFitting") || "Virtual Fitting Solution"}
                </h3>
                <p className="text-gray-600">
                  {t("ui.solution.fashion.virtualFittingDescription") || "Try on clothes virtually with your own photos."}
                </p>
              </div>

              <div
                className="cursor-pointer group relative overflow-hidden rounded-xl border-2 border-gray-100 hover:border-purple-500 transition-all duration-300 bg-white p-6 shadow-sm hover:shadow-md"
                onClick={() => setFashionSolutionType("item-fitting")}
              >
                <div className="aspect-video relative mb-4 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-12 h-12 text-purple-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {t("ui.solution.fashion.itemFitting") || "Item Fitting Solution"}
                </h3>
                <p className="text-gray-600">
                  {t("ui.solution.fashion.itemFittingDescription") || "Try items on sample models."}
                </p>
              </div>

              <div
                className="cursor-pointer group relative overflow-hidden rounded-xl border-2 border-gray-100 hover:border-indigo-500 transition-all duration-300 bg-white p-6 shadow-sm hover:shadow-md"
                onClick={() => setFashionSolutionType("hair-fitting")}
              >
                <div className="aspect-video relative mb-4 bg-gradient-to-br from-indigo-100 to-pink-100 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-12 h-12 text-indigo-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {t("ui.solution.fashion.hairFitting") || "Hair Style Solution"}
                </h3>
                <p className="text-gray-600">
                  {t("ui.solution.fashion.hairFittingDescription") || "Try different hair styles."}
                </p>
              </div>

              <div
                className="cursor-pointer group relative overflow-hidden rounded-xl border-2 border-gray-100 hover:border-orange-500 transition-all duration-300 bg-white p-6 shadow-sm hover:shadow-md"
                onClick={() => setFashionSolutionType("dyeing-fitting")}
              >
                <div className="aspect-video relative mb-4 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-12 h-12 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {t("ui.solution.fashion.dyeingFitting") || "Dyeing Solution"}
                </h3>
                <p className="text-gray-600">
                  {t("ui.solution.fashion.dyeingFittingDescription") || "Try different hair or clothing colors."}
                </p>
              </div>

              <div
                className="cursor-pointer group relative overflow-hidden rounded-xl border-2 border-gray-100 hover:border-rose-500 transition-all duration-300 bg-white p-6 shadow-sm hover:shadow-md"
                onClick={() => setFashionSolutionType("lipstick-fitting")}
              >
                <div className="aspect-video relative mb-4 bg-gradient-to-br from-rose-100 to-pink-100 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-12 h-12 text-rose-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {t("ui.solution.fashion.lipstickFitting") || "Lipstick Solution"}
                </h3>
                <p className="text-gray-600">
                  {t("ui.solution.fashion.lipstickFittingDescription") || "Try different lipstick colors."}
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-4">
              {fashionSolutionType === "virtual-fitting" && <VirtualFitting />}
              {fashionSolutionType === "item-fitting" && <ItemFitting />}
              {fashionSolutionType === "hair-fitting" && <HairFitting />}
              {fashionSolutionType === "dyeing-fitting" && <DyeingFitting />}
              {fashionSolutionType === "lipstick-fitting" && <LipstickFitting />}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

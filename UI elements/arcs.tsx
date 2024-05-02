import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import { arc, select, interpolate, scaleLinear } from "d3";
import cx from "classnames";

import { iResultBiomarkerCard } from "../ResultBiomarkerCard.interface";
import { IconFromName } from "@/components/AssetsManager/AssetsManager";
import { isEmpty } from "@/utils/helper";

const CLIENT_WIDTH = 166;

// For accompanying explanation, see https://doc.clickup.com/2646590/p/h/2grhy-86415/39782aafb4bc3df
// Disclaimer: This is sample code serving as inspiration

export const BiomarkerArcCard = ({ biomarker }: iResultBiomarkerCard) => {
    const { t } = useTranslation();
    const ref = useRef<SVGSVGElement>(null);

    const deg2rad = (deg: number) => {
        return (deg - 90) * (Math.PI / 180);
    };

    const __value = (value: string) => {
        if (biomarker.name === "mental_health_risk") {
            switch (parseInt(value)) {
                case 3:
                    return t("high");
                case 2:
                    return t("medium");
                default:
                    return t("low");
            }
        }

        return value;
    };

    useEffect(() => {
        if (!ref.current || isEmpty(biomarker.value)) return;

        const containerHeight = CLIENT_WIDTH / 2;

        const svg = select(ref.current);
        const container = svg.append("g").attr("transform", function (d, i) {
            return `translate(${CLIENT_WIDTH / 2}, ${containerHeight})`;
        });

        const scale = scaleLinear().domain(biomarker.range).range([0, 180]);

        const baseArcGen = arc()
            .cornerRadius(20)
            .innerRadius(containerHeight - 6)
            .outerRadius(containerHeight - 2)
            .startAngle(-Math.PI / 2)
            .endAngle(Math.PI / 2);

        const activeArcGen = arc()
            .cornerRadius(20)
            .innerRadius(containerHeight - 8)
            .outerRadius(containerHeight)
            .startAngle(deg2rad(0));

        const baseArc = container
            .append("path")
            .attr("class", "arc")
            // @ts-ignore
            .attr("d", baseArcGen)
            // .attr("fill", "rgba(219, 225, 246, 1)");
            .attr("class", "fill-support-300");

        const activeArc = container
            .append("path")
            .attr("class", "arc-active")
            .classed("fill-functional-tertiary-500", biomarker.zone === "good")
            .classed("fill-functional-secondary-500", biomarker.zone === "neutral")
            .classed("fill-functional-primary-500", biomarker.zone === "bad")
            // @ts-ignore
            .attr("d", () => activeArcGen({ endAngle: deg2rad(0) }));
        // .attr("fill", "rgba(98, 227, 142, 1)");

        activeArc
            .transition()
            .duration(500)
            .attrTween("d", function (d: any) {
                var i = interpolate(0 + 0.1, scale(parseFloat(biomarker.value)));

                return function (t) {
                    // @ts-ignore
                    return activeArcGen({ endAngle: deg2rad(i(t)) });
                };
            });
        // .attr("d", () => activeArcGen({ endAngle: deg2rad(100) }))
    }, [ref.current, biomarker.value]);

    return (
        <div className="measurement-result-arc">
            <div className="sm:aspect-2/1 relative w-full">
                <svg ref={ref} viewBox={`0 0 ${CLIENT_WIDTH} 80`} className="w-full" />
                <div
                    className={cx(
                        "absolute w-full h-full items-end justify-center flex",
                        {
                            "bottom-[15px]": biomarker.name !== "mental_health_risk",
                            "bottom-[3px]": biomarker.name === "mental_health_risk",
                        }
                    )}
                >
                    <div
                        className={cx("flex", {
                            "flex-col": biomarker.name === "mental_health_risk",
                        })}
                    >
                        <div
                            className={cx({
                                "mr-1 sm:mr-2": biomarker.name !== "mental_health_risk",
                                "flex items-center justify-center":
                                    biomarker.name === "mental_health_risk",
                            })}
                        >
                            <IconFromName
                                name={biomarker.name}
                                className={cx("w-[10vw] sm:w-[56px]")}
                            />
                        </div>
                        <div className="flex items-center justify-center">
                            <span
                                className={cx(
                                    "text-brand-secondary font-bold",
                                    biomarker.name === "mental_health_risk"
                                        ? "text-[3vw]"
                                        : "text-[4vw]",
                                    {
                                        "text-[6vw] sm:text-4xl": !isNaN(
                                            parseInt(__value(biomarker.value))
                                        ),
                                        "sm:text-xl leading-none": isNaN(
                                            parseInt(__value(biomarker.value))
                                        ),
                                        "text-functional-secondary-500":
                                            biomarker.zone === "neutral",
                                        "text-functional-primary-500": biomarker.zone === "bad",
                                    }
                                )}
                            >
                                {__value(biomarker.value)}
                            </span>
                            {!!biomarker.unit && (
                                <span className="ml-2 text-primary text-support-500 text-[3vw] sm:text-[20px]">
                                    {biomarker.unit}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="w-full flex flex-row justify-between">
                    {biomarker.range.map((range) => {
                        return (
                            <span
                                key={range.toString()}
                                className={cx(
                                    "text-primary text-support-500 sm:text-[13px]",
                                    biomarker.name === "mental_health_risk"
                                        ? "text-[2.5vw]"
                                        : "text-[3vw]",
                                    {
                                        "text-[2vw] sm:text-[12px]": isNaN(
                                            parseInt(__value(range.toString()))
                                        ),
                                    }
                                )}
                            >
                                {__value(range.toString())}
                            </span>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

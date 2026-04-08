import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import useStore from '../store/useStore';
import { getUserLocation } from '../utils/geolocation';
import { fetchWeather } from '../utils/weather';
import { getSunPositionVector, getTimeOfDayFactor, getSkyParameters } from '../utils/sunCalc';
import { PROJECTS } from '../data/portfolio';

import WalkController from './balcony/WalkController';
import BalconyStructure from './balcony/BalconyStructure';
import CozyElements from './balcony/CozyElements';
import DisplayPedestal from './balcony/DisplayPedestal';
import PortfolioObject from './balcony/PortfolioObject';
import ProductDesign from './balcony/items/ProductDesign';
import KineticSculpture from './balcony/items/KineticSculpture';
import ResearchPaper from './balcony/items/ResearchPaper';
import AboutModel from './balcony/items/AboutModel';
import DiaryModel from './balcony/items/DiaryModel';
import ContactModel from './balcony/items/ContactModel';
import DynamicSky from './environment/DynamicSky';
import DynamicLighting from './environment/DynamicLighting';
import Campus from './environment/Campus';
import WeatherEffects from './environment/WeatherEffects';
import PostEffects from './environment/PostEffects';
import HorizonTerrain from './horizon/HorizonTerrain';
import AtmosphericFog from './horizon/AtmosphericFog';
import NavigationOrbs from './ui/NavigationOrbs';
import Fireflies from './extras/Fireflies';
import ShootingStars from './extras/ShootingStars';
import DistantCityLights from './extras/DistantCityLights';
import SoundscapeManager from './audio/SoundscapeManager';

// Portfolio items from centralized data — edit in src/data/portfolio.js
// Only items with a `position` field get a 3D representation
const PORTFOLIO_ITEMS = PROJECTS.filter((p) => p.position);

export default function SceneController() {
  const setSunPosition = useStore((s) => s.setSunPosition);
  const setTimeOfDay = useStore((s) => s.setTimeOfDay);
  const setIsNight = useStore((s) => s.setIsNight);
  const setWeather = useStore((s) => s.setWeather);
  const setLiveWeather = useStore((s) => s.setLiveWeather);
  const setUserLocation = useStore((s) => s.setUserLocation);
  const setIsLoaded = useStore((s) => s.setIsLoaded);
  const setQualityLevel = useStore((s) => s.setQualityLevel);
  const autoQuality = useStore((s) => s.autoQuality);
  const qualityLevel = useStore((s) => s.qualityLevel);
  const userLocation = useStore((s) => s.userLocation);
  const timeOverride = useStore((s) => s.timeOverride);
  const weatherOverride = useStore((s) => s.weatherOverride);
  const liveWeather = useStore((s) => s.liveWeather);
  const lastUpdate = useRef(0);

  const computeSun = (date, lat, lon) => {
    let d = date;
    if (timeOverride !== null) {
      d = new Date(date);
      d.setHours(Math.floor(timeOverride), (timeOverride % 1) * 60, 0);
    }
    setSunPosition(getSunPositionVector(d, lat, lon));
    setTimeOfDay(getTimeOfDayFactor(d, lat, lon));
    setIsNight(getSkyParameters(d, lat, lon).isNight);
  };

  // Apply weather override — preserve real data, only swap the condition
  useEffect(() => {
    if (weatherOverride && liveWeather) {
      setWeather({ ...liveWeather, condition: weatherOverride });
    } else if (weatherOverride) {
      // No live data yet — use defaults with override condition
      setWeather({ condition: weatherOverride, temperature: 25, humidity: 50, windSpeed: 3, cloudCover: 0 });
    } else if (liveWeather) {
      setWeather(liveWeather);
    }
  }, [weatherOverride, liveWeather, setWeather]);

  useEffect(() => {
    let dead = false;

    // PREVENT FLASH GLITCH: Initialize sun immediately using default/approx location (Bhopal)
    // so that isNight/Bloom evaluate correctly on frame 1 without flashing bright later.
    computeSun(new Date(), 23.2599, 77.4126); 

    (async () => {
      const loc = await getUserLocation();
      if (dead) return;
      setUserLocation(loc);
      computeSun(new Date(), loc.lat, loc.lon);
      const w = await fetchWeather(loc.lat, loc.lon);
      if (dead) return;
      setLiveWeather(w);
      if (!weatherOverride) setWeather(w);
      setTimeout(() => { if (!dead) setIsLoaded(true); }, 600);
    })();
    return () => { dead = true; };
  }, []);

  useEffect(() => {
    if (userLocation) computeSun(new Date(), userLocation.lat, userLocation.lon);
  }, [timeOverride, userLocation]);

  useEffect(() => {
    if (!userLocation) return;
    const id = setInterval(async () => {
      try {
        const w = await fetchWeather(userLocation.lat, userLocation.lon);
        setLiveWeather(w);
      } catch (err) {
        console.warn('Weather refresh failed:', err);
      }
    }, 600000);
    return () => clearInterval(id);
  }, [userLocation, setLiveWeather]);

  useFrame(({ clock }) => {
    if (!userLocation || timeOverride !== null) return;
    const now = Date.now();
    if (now - lastUpdate.current > 30000) {
      lastUpdate.current = now;

      computeSun(new Date(), userLocation.lat, userLocation.lon);
    }
  });

  return (
    <>
      <PerformanceMonitor
        onDecline={() => {
          if (!autoQuality) return;
          const l = ['high', 'medium', 'low'];
          const i = l.indexOf(qualityLevel);
          if (i < 2) setQualityLevel(l[i + 1]);
        }}
        onIncline={() => {
          if (!autoQuality) return;
          const l = ['high', 'medium', 'low'];
          const i = l.indexOf(qualityLevel);
          if (i > 0) setQualityLevel(l[i - 1]);
        }}
      />

      <WalkController />
      <DynamicSky />
      <DynamicLighting />
      <AtmosphericFog />
      <WeatherEffects />
      <Campus />
      <BalconyStructure />
      <CozyElements />

      {PORTFOLIO_ITEMS.map((item) => (
        <group key={item.id} position={item.position}>
          <DisplayPedestal color={item.color} />
          <PortfolioObject item={item}>
            {item.id === 'product-design' && <ProductDesign />}
            {item.id === 'kinetic-sculpture' && <KineticSculpture />}
            {item.id === 'research-papers' && <ResearchPaper />}
            {item.id === 'about-trigger' && <AboutModel />}
            {item.id === 'diary-trigger' && <DiaryModel />}
            {item.id === 'contact-trigger' && <ContactModel />}
          </PortfolioObject>
        </group>
      ))}

      <NavigationOrbs items={PORTFOLIO_ITEMS} />
      <HorizonTerrain />
      <Fireflies />
      <ShootingStars />
      <DistantCityLights />
      <SoundscapeManager />
      <PostEffects />
    </>
  );
}

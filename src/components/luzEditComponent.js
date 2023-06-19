import React from "react";
import Toggle from "react-toggle";
import { Slider } from "@mui/material";
import "react-toggle/style.css";
import { useState, useEffect, useRef } from "react";
import { NavLink, useParams } from "react-router-dom";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight, MdOutlineWbSunny, MdSunny, MdBrightnessAuto, MdBrightnessHigh,MdBrightnessLow } from "react-icons/md";
import colores from "../assets/colores.png";

import "./luzEditComponent.css";
import mqtt from "mqtt/dist/mqtt";
import apic from "../services/apiService";
export default function LuzEditComponent() {
  //---------------------------- declaracion de varibles ---------------------------------

  const { id } = useParams(); // id
  const [lucesData, setlucesData] = useState({});
  const [estado, setEstado] = useState(); //Este es para el  ESTADO tonggle switch
  const [brillo, setBrillo] = useState(); //Este para el  BRILLO slider
  const [showValue, setShowValue] = useState(false); // mostrar valor o no
  const [color, setColor] = useState(); //Est es para el seleccionador de COLOR
  const [circlePosition, setCirclePosition] = useState({ x: 0, y: 0 }); //circulo de colores
  const imgRef = useRef(null);

  useEffect(() => {
    // ----------------------------------GET a la API -----------------------
    const fetchData = async () => {
      try {
        const luzis = await apic.get('/luces/' + id);
        setlucesData({
          nombre: luzis.luz.nombre,
          estado: luzis.luz.estado,
          brillo: luzis.luz.brillo,
          programar: luzis.luz.programar,
          color: luzis.luz.color,
        });
        setBrillo(luzis.luz.brillo);
        setEstado(luzis.luz.estado);
        setColor(luzis.luz.color);

      } catch (error) {
        console.error('Error al obtener los datos de luces:', error);
      }
    };
    fetchData();
  },[id]);
  const shouldRenderControls = brillo !== undefined && estado !== undefined;
  // ----------------------------- conexion con mqtt -----------------------------------------
  //const client = mqttConnection();
  const client = mqtt.connect("ws://localhost:8083/mqtt"); //ws://192.168.1.81:8083/mqtt
  client.on("connect", () => {
    if(shouldRenderControls){
      const nombretopic = lucesData.nombre.toLowerCase().replace(/\s/g, "");
      client.subscribe(`domotica/luz/${nombretopic}`, (err) => {
        if (err) {console.error("Error al suscribirse al topic de domotica/luz/sala:",err);}
        else {console.log("Suscripción exitosa al topic domotica/luz/sala");}
      });
  }
  });

  //-------------------------------------- Metodo y funciones  --------------------------------------------

    //Encendido y apagado de las luces
    const handleToggle = () => {
      const newEstado = !estado; // Obtener el nuevo valor de estado
      setEstado(newEstado); // Actualizar el estado
      console.log("Estado de la luz:", newEstado);

      // Actualizar solo el estado en lucesData
      setlucesData(prevData => ({
        ...prevData,
        estado: newEstado
      }));
    };

      //Intensidad de la luz
    const handleChange = (event, newValue) => {
      setBrillo(newValue);
      console.log(brillo);
      console.log("Cambiando el brillo:", brillo);
      setlucesData(prevData => ({
        ...prevData,
        brillo: brillo
      }));
      setShowValue(true);
    };

    const handleMouseUp = () => {
      setShowValue(false);
    };

      //Est es para el seleccionador de color
    function handleColorPicker(e) {
      const canvas = document.createElement("canvas");
      const img = imgRef.current;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, img.width, img.height);
      const pixelData = ctx.getImageData(
        e.nativeEvent.offsetX,
        e.nativeEvent.offsetY,
        1,
        1
      ).data;
      const color = `rgb(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]})`;
      setColor(color);
      const pixelPos = getPixelPosition(
        ctx,
        img.width,
        e.nativeEvent.offsetX,
        e.nativeEvent.offsetY
      );
      setCirclePosition({ x: pixelPos.x, y: pixelPos.y });
      setlucesData(prevData => ({
        ...prevData,
        color: color
      }));
    }

    function handleColorSelect(botonColor) {
      setColor(botonColor);
      const canvas = document.createElement("canvas");
      const img = imgRef.current;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, img.width, img.height);

      // Obtener la posición del pixel correspondiente al color seleccionado
      const pixelData = ctx.getImageData(0, 0, img.width, img.height).data;
      let pixelPos = null;
      for (let y = 0; y < img.height; y++) {
        for (let x = 0; x < img.width; x++) {
          const index = (y * img.width + x) * 4;
          const color = `rgb(${pixelData[index]}, ${pixelData[index + 1]}, ${
            pixelData[index + 2]
          })`;
          if (color === botonColor) {
            pixelPos = getPixelPosition(ctx, img.width, x, y);
            break;
          }
        }
        if (pixelPos) {
          break;
        }
      }

      if (pixelPos) {
        setCirclePosition({ x: pixelPos.x, y: pixelPos.y });
      }
    }

    function getPixelPosition(ctx, imgWidth, x, y) {
      const index = (y * imgWidth + x) * 4;
      const data = ctx.getImageData(0, 0, imgWidth, imgWidth).data;
      return {
        x: x,
        y: y,
        index: index,
        r: data[index],
        g: data[index + 1],
        b: data[index + 2],
        a: data[index + 3],
      };
    }

    function handleWhiteColorSelect() {
      setColor("rgb(255, 255, 255)");
      setCirclePosition({
        x: "48%",
        y: "45%",
      });
    }

  useEffect(() => {
    //conexion MQTT
    client.on("message", (topic, message) => {
      console.log("Mensaje recibido en el topic ",topic,":",message.toString());
    });

    return () => {
      client.end(); // Cerrar la conexión MQTT al desmontar el componente
    };

  }, [estado, brillo, color, client]);

  const putLuces = async (data) => {
    try{console.log("Data desde el put",data);
    const brokerdata = {
      id: id,
      ...data, // Copia todas las propiedades de "data" en "brokerdata"
    };
    if(shouldRenderControls){
      const nombreFormateado = data.nombre.toLowerCase().replace(/\s/g, "");
      client.publish(`domotica/luz/${nombreFormateado}`, brokerdata.toString(), (error) => {
        if (error) {
          console.error('Error al publicar el mensaje:', error);
        } else {
          console.log(`>>>>>> publicado correctamente a ${nombreFormateado}  :`,brokerdata);
        }
      });
    }
    await apic.put('/luces/'+id, data);}
    catch (error) {
      console.error('Error enviar las luces:', error);
    }

  };

  console.log("lucesData",lucesData);
  putLuces(lucesData);


  return (
    <div className="LucesEdit">
      <div style={{ display: "flex", alignItems: "center" }}>
        <NavLink activeClassName="active" to="/luces" className="returnboton">
          <MdKeyboardArrowLeft size={40} style={{ color: "#2141df" }} />
        </NavLink>
        <span id="title">{lucesData.nombre}</span>
      </div>
      <div id="controlcontainer">
        <div className="controlluces">
          <span className="btitle">Estado</span>
          {shouldRenderControls && (
            <Toggle
              defaultChecked={estado}
              onChange={handleToggle}
              icons={false}
              className="my-toggle-class"
            />
          )}
        </div>
        <div className="controlluces" id="programarContainer">
          <span className="text">
            <span className="btitle">Programar</span>
            <span className="bsubtitle">encendido y apagado</span>
          </span>
          <NavLink
            activeClassName="active"
            to="/luces"
            style={{ display: "flex", alignItems: "center" }}
          >
            <span className="bsubtitle">{lucesData.programar}</span>
            <MdKeyboardArrowRight size={30} style={{ color: "#fff" }} />
          </NavLink>
        </div>
      </div>

      <div id="luceseditcontainer">
        <div id="brillocontrolcontainer">
          <span className="btitle">Brillo</span>
          <div id="slider">
          {shouldRenderControls && (
              <Slider
                orientation="vertical"
                value={brillo}
                onChange={handleChange}
                onMouseUp={handleMouseUp}
                aria-labelledby="continuous-slider"
                sx={{
                  color: "white",
                  borderRadius: 5,
                  height: "100%",
                  "& .MuiSlider-thumb": {
                    marginBottom: -1.5,
                    height: 7,
                    width: 45,
                    color: "#444",
                    borderRadius: 3,
                  },
                  "& .MuiSlider-track": {
                    borderRadius:
                      brillo >= 95 || brillo <= 5 ? 5 : "0px 0px 22px 22px",
                  },
                }}
              />
            )}
            <div className="luzicono">
              <MdSunny size={30} /> {showValue && <span>{brillo}</span>}
              <MdOutlineWbSunny size={30} />
            </div>
          </div>
        </div>

        <div id="colorcontrolcontainer">
          <span className="btitle">Color</span>
          <div className="imgColor">
            <img src={colores} id="colores" onClick={handleColorPicker} ref={imgRef} alt="imgColor"/>
            {color && (
              <div
                id="circulo"
                style={{
                  marginTop: "5.5%",
                  marginLeft: "-3.5%",
                  backgroundColor: color,
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  position: "absolute",
                  top: circlePosition.y,
                  left: circlePosition.x,
                  border: "2px solid black",
                }}></div>
            )}
          </div>
          <div className="coloresboton">
            <div style={{ backgroundColor: "rgb(251, 250, 162)" }} onClick={() => handleColorSelect("rgb(251, 250, 162)")}>
              <MdBrightnessHigh size={25} />
            </div>
            <div style={{ backgroundColor: "white" }} onClick={handleWhiteColorSelect}>
              <MdBrightnessAuto size={25} />
            </div>
            <div style={{ backgroundColor: "rgb(204, 205, 249)" }} onClick={() => handleColorSelect("rgb(204, 205, 249)")}>
              <MdBrightnessLow size={25} />
            </div>
          </div>
          <div style={{ backgroundColor: color }} className="viewcolor"></div>
        </div>
      </div>
    </div>
  );
}

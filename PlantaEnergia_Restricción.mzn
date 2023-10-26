
%=============Probléma Centrales Eléctricas=================

%===================David Alberto Guzmán    - 1942789
%===================Diego Fernando Chaverra - 1940322
%===================Faver Agustín Granja    - 1910205

%===================Modelo genérico========================
%==========================================================
%==========================================================
%==================Lectura de datos========================
%==========================================================
%==========================================================

int: n; %Cantidad de días

int: m; %Cantidad de Clientes

int: capN; %Máxima capacidad de produción diaria en MW para central Nuclear
int: capH; %Máxima capacidad de produción diaria en MW para central Hidroelétrica
int: capT; %Máxima capacidad de produción diaria en MW para central Termica

int: cosN; %Costo de producir 1MW para la central Nuclear
int: cosH; %Costo de producir 1MW para la central Hidroeléctrica
int: cosT; %Costo de producir 1MW para la central Térmica

array [1..m, 1..n] of int:d; %matriz de demanda diaria por cada cliente m en un dia n

int: G; %Garantía ó Requerimiento minimo si la demanda diaria en un dia n, supera la capacida de procucion de las tres cebtrales (capN+capH+capT)

array[1..m] of int: P; %pago individual por cada cliente m

%==========================================================
%==========================================================
% parametros extras para el problema del desgate de tubinas
%==========================================================
%==========================================================

int: ns; %numeros de dias consecutivos que no se puden producir en regimen superior
int: ps; %Porcentaje minimo para saver que la producion no es de regimen superior

%==========================================================
%==========================================================
%=========================Variables========================
%==========================================================
%==========================================================

array [1..n] of var 0..capN: pdN; %Produción de la central Nuclear en un dia n
array [1..n] of var 0..capH: pdH; %Produción de la central Hidroeléctrica en un dia n
array [1..n] of var 0..capT: pdT; %Produción de la central Térmica en un dia n

array [1..m, 1..n] of var 0..(capN+capH+capT):pmC; %Producion máxima dada a cada clientes

var int: PH; %Representa la ganancia neta obtenida por producccion de y entrega de MW en un horizonte n a m clientes

%==========================================================
%==========================================================
%=======================Restriciones========================
%==========================================================
%==========================================================

constraint forall (s in 1..m,i in 1..n)(
     (pmC[s,i])<=(d[s,i])
);

constraint forall (s in 1..m,i in 1..n)(
     (pmC[s,i])>=d[s,i]*G div 100
);

constraint forall (i in 1..n)(
    sum(s in 1..m)(pmC[s,i])<= (capN+capH+capT)
);

constraint forall (i in 1..n)(
    sum (s in 1..m)(pmC[s,i]) <= (pdN[i]+pdH[i]+pdT[i])
);

constraint forall (i in 1..n)(
   pdN[i] <= capN
);

constraint forall (i in 1..n)(
   pdH[i] <= capH
);

constraint forall (i in 1..n)(
   pdT[i] <= capT
);

constraint ns <= n;

%==========================================================
%==========================================================
% Restriccion para garantizar que las producion Hidroelectrica no produsca ns dias consecutivo en regimen alto
%==========================================================
%==========================================================

constraint forall (i in 1..n)(
   pdH[i]<=(if ((i-ns)>=0 /\ pdH[i]> (capH*ps div 100) /\ (forall(e in 1..ns-1) (pdH[i-e]> (capH*ps div 100))))
   then
        capH * ps div 100 
   else
        capH 
   endif
   )
);



%==========================================================
%==========================================================
%=====================No Negatividad=======================
% para las matrices y vectores, la restrición se les asigno en la definicion de la varaible
%==========================================================
%==========================================================

constraint PH >= 0;
constraint n >= 0;
constraint m >= 0;
constraint ns >= 0;
constraint ps >= 0;
constraint G >= 0;
constraint cosN >= 0;
constraint cosH >= 0;
constraint cosT >= 0;
constraint capN >= 0;
constraint capH >= 0;
constraint capT >= 0;
constraint forall (s in 1..m)(
  P[s] >= 0
);
constraint forall (s in 1..m,i in 1..n) (
  d[s,i] >= 0
);

%==========================================================
%==========================================================
%====================Función Objetivo======================
%Se busca maximizar la ganancia neta obtenida de entregar una cantidad de MW a s clientes en n dias
%==========================================================
%==========================================================

constraint PH = sum(i in 1..n)(
   (sum (s in 1..m)(P[s]*pmC[s,i]))-
          (cosN*pdN[i]+cosH*pdH[i]+cosT*pdT[i])
);  





solve maximize PH;

%==========================================================
%==========================================================
%==============Interpretación de resultado=================
%Se busca darle un contexto a la salida para que sea bien interpretada
%==========================================================
%==========================================================

output["Produccion Entregada a Cliente: \n",show(pmC),"\n"];
output["Demanda: \n", show(d),"\n"];
output["Produccion Central Nuclear: \n",show(pdN),"\n"];
output["Produccion Central Hidroeléctrica: \n",show(pdH),"\n"];
output["Produccion Central Térmica: \n",show(pdT),"\n"];
output["Funcion Objetivo: \n",show(PH)];


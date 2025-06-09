import brain from "brain.js";
import { trainingData } from "../constants/data.js";

const network = new brain.NeuralNetwork();
network.train(trainingData);

export default network;

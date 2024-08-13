import React from "react";
import { Player } from "csgogsi-socket";
import Weapon from "./../Weapon/Weapon";
import Avatar from "./Avatar";
import TeamLogo from "./../MatchBar/TeamLogo";
import "./observed.scss";
import { apiUrl } from './../../api/api';
import { getCountry } from "./../countries";
import { ArmorHelmet, ArmorFull, HealthFull, Bullets, KillIcon, Skull, AssistCT, AssistT } from './../../assets/Icons';
import { Veto } from "../../api/interfaces";
import { actions } from "../../App";

class Statistic extends React.PureComponent<{ label: string | React.ReactNode; value: string | number, }> {
	render() {
		return (
			<div className="stat">
				<div className="label">{this.props.label}</div>
				<div className="value">{this.props.value}</div>
			</div>
		);
	}
}

export default class Observed extends React.Component<{ player: Player | null, veto: Veto | null, round: number }, { showCam: boolean }> {
	constructor(props: any){
		super(props);
		this.state = {
		  showCam: true
		}
	  }
	componentDidMount() {
		actions.on('toggleCams', () => {
			console.log(this.state.showCam)
			this.setState({ showCam: !this.state.showCam });
		});
	}
	getAdr = () => {
		const { veto, player } = this.props;
		if (!player || !veto || !veto.rounds) return null;
		const damageInRounds = veto.rounds.map(round => round ? round.players[player.steamid] : {
			kills: 0,
			killshs: 0,
			damage: 0
		}).filter(data => !!data).map(roundData => roundData.damage);
		 
		return damageInRounds.reduce((a, b) => a + b, 0) / (this.props.round - 1);
	}

	getHealthBarWidth = (health: number, min: number, max: number) => {
		if (health > min && health <= max) {
			return health + "%";
		}
		if (health <= min) {
			return "0%";
		}
		if (health > max) {
			return "100%";
		}
		return "0%";
	}
	
	render() {
		if (!this.props.player) return '';
		const { player } = this.props;
		const country = player.country || player.team.country;
		const weapons = Object.values(player.weapons).map(weapon => ({ ...weapon, name: weapon.name.replace("weapon_", "") }));
		const currentWeapon = weapons.filter(weapon => weapon.state === "active")[0];
		const grenades = weapons.filter(weapon => weapon.type === "Grenade");
		const { stats } = player;
		const ratio = stats.deaths === 0 ? stats.kills : stats.kills / stats.deaths;
		const countryName = country ? getCountry(country) : null;
		const assistIcon = player.team.side == "T" ? AssistT : AssistCT;
		return (
			<>
			<div className="observed-background"/>
			<div className={`observed ${player.team.side}`}>
				<div className="obs-avatar-container">
					{<Avatar steamid={player.steamid} height={140} width={140} showCam={this.state.showCam} slot={player.observer_slot} team={player.team.side}/>}
				</div>
				<div className="main_row">
					<div className="obs-top">
						<div className="username_container">
							{/* <TeamLogo team={player.team} height={35} width={35} /> */}
							<div className="username">{player.name}</div>						</div>
						<div className="armor-icon icon">
							{player.state.helmet ? <ArmorHelmet /> : <ArmorFull />}
						</div>
					</div>
					<div className="obs-middle">
						<div className="stats_row">
							<div className="statistics">
								<Statistic label={<KillIcon/>} value={stats.kills} />
								<Statistic label={<img src={assistIcon}/>} value={stats.assists} />
								<Statistic label={<Skull/>} value={stats.deaths} />
								<Statistic label={"ADR"} value={player.state.adr} />
							</div>
						</div>
							<div className="grenade_container">
							{grenades.map(grenade => <React.Fragment key={`${player.steamid}_${grenade.name}_${grenade.ammo_reserve || 1}`}>
								<Weapon weapon={grenade.name} active={grenade.state === "active"} isGrenade />
								{
									grenade.ammo_reserve === 2 ? <Weapon weapon={grenade.name} active={grenade.state === "active"} isGrenade /> : null}
							</React.Fragment>)}
						</div>
					</div>
					<div className="obs-bottom">
						<div className="obs-health">
							<div className="health_armor_container">
								<div className="health-icon icon"><HealthFull /></div>
								<div className="health text">{player.state.health}</div>
							</div>
							<div className="healthbar-container">
								<div className="obs-healthblock">
									<div className="obs-hpbar1" style={{ width: this.getHealthBarWidth(player.state.health, 0, 25) }}/>
								</div>
								<div className="obs-healthblock">
									<div className="obs-hpbar2" style={{ width: this.getHealthBarWidth(player.state.health, 25, 50) }}/>
								</div>
								<div className="obs-healthblock">
									<div className="obs-hpbar3" style={{ width: this.getHealthBarWidth(player.state.health, 50, 75) }}/>
								</div>
								<div className="obs-healthblock">
									<div className="obs-hpbar4 " style={{ width: this.getHealthBarWidth(player.state.health, 75, 100) }}/>
								</div>
							</div>
						</div>
						<div className="ammo">
							<div className="ammo_counter">
								<div className="ammo_clip">{(currentWeapon && currentWeapon.ammo_clip) || "-"}</div>
								<div className="ammo_reserve">/{(currentWeapon && currentWeapon.ammo_reserve) || "-"}</div>
							</div>
							<div className="ammo_icon_container">
									<Bullets />
								</div>
						</div>
					</div>
				</div>
			</div>
		</>
		);
	}
}

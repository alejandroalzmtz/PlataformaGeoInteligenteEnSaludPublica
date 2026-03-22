using AutoMapper;
using SaludPublicaBackend.Dtos.User;
using SaludPublicaBackend.Models;
using SaludPublicaBackend.Dtos.RegistroMedicoDto;
using SaludPublicaBackend.Dtos.ActividadUsuarioDto;
using SaludPublicaBackend.Dtos.EnfermedadDto;
using SaludPublicaBackend.Dtos.RolDto;
using SaludPublicaBackend.Dtos.NoticiaDto;
using SaludPublicaBackend.Dtos.PanelDto;
using SaludPublicaBackend.Dtos.HospitalesDto;
using SaludPublicaBackend.Dtos.ServicioMedicoDto;
using SaludPublicaBackend.Dtos.ProcedenciaDto;
using SaludPublicaBackend.Dtos.PoblacionEstadoDto;
using SaludPublicaBackend.Dtos.PoblacionEstadoAnualDto;
using SaludPublicaBackend.Dtos.RangoEdadDto;
using SaludPublicaBackend.Dtos.EstadosDto;
using SaludPublicaBackend.Dtos.MunicipioDto;
using SaludPublicaBackend.Dtos.LocalidadDto;
using SaludPublicaBackend.Dtos.DerechoHabDto;
using SaludPublicaBackend.Dtos.MotivosEDto;
using SaludPublicaBackend.Dtos.LogoPdfDto;

namespace SaludPublicaBackend.Configurations.Mapper
{
  public class MapperConfigurations : Profile
  {
    public MapperConfigurations()
    {
      #region Users
      CreateMap<RegisterUserDto, Usuario>();
      CreateMap<GetUserDto, Usuario>();
      #endregion
      #region Registro Medico
      CreateMap<RegistroMedico, GetRegistroMedicoDto>().ReverseMap();
      CreateMap<RegisterRegistroMedicoDto, RegistroMedico>();
      #endregion
      #region Actividad Usuario
      CreateMap<ActividadUsuario, GetActividadUsuarioDto>().ReverseMap();
      CreateMap<RegisterActividadUsuarioDto, ActividadUsuario>();
      #endregion
      #region Enfermedad
      CreateMap<RegisterEnfermedadDto, Enfermedad>();
      CreateMap<Enfermedad, GetEnfermedadDto>().ReverseMap();
      CreateMap<UpdateEnfermedadDto, Enfermedad>()
        .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));

      #endregion
      #region Rol
      CreateMap<RegisterRolDto, Rol>();
      CreateMap<Rol, GetRolDto>().ReverseMap();
      #endregion
      #region Noticia
      CreateMap<CreateNoticiaDto, Noticia>();
      CreateMap<UpdateNoticiaDto, Noticia>().ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));
      CreateMap<Noticia, GetNoticiaDto>().ReverseMap();
      #endregion
      #region Hospitales
      CreateMap<Hospitales, GetHospitalesDto>();
      #endregion

      #region ServicioMedico
      CreateMap<ServicioMedico, GetServicioMedicoDto>().ReverseMap();
      CreateMap<RegisterServicioMedicoDto, ServicioMedico>();
      CreateMap<UpdateServicioMedicoDto, ServicioMedico>()
        .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));
      #endregion

      #region Procedencia
      CreateMap<Procedencia, GetProcedenciaDto>().ReverseMap();
      CreateMap<RegisterProcedenciaDto, Procedencia>();
      CreateMap<UpdateProcedenciaDto, Procedencia>()
        .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));
      #endregion

      #region PoblacionEstado
      CreateMap<CreatePoblacionEstadoDto, PoblacionEstado>();
      CreateMap<UpdatePoblacionEstadoDto, PoblacionEstado>().ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));
      CreateMap<PoblacionEstado, GetPoblacionEstadoDto>().ReverseMap();
      #endregion
      #region PoblacionEstadoAnual
      CreateMap<CreatePoblacionEstadoAnualDto, PoblacionEstadoAnual>();
      CreateMap<UpdatePoblacionEstadoAnualDto, PoblacionEstadoAnual>().ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));
      CreateMap<PoblacionEstadoAnual, GetPoblacionEstadoAnualDto>().ReverseMap();
      #endregion
      #region RangoEdad
      CreateMap<RangoEdad, GetRangoEdadDto>().ReverseMap();
      CreateMap<RegisterRangoEdadDto, RangoEdad>();
      #endregion
      #region Catálogo Estados
      CreateMap<RegisterEstadoDto, Estado>();
      CreateMap<UpdateEstadoDto, Estado>()
        .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));
      CreateMap<Estado, GetEstadosDto>();
      #endregion
      #region Catálogo Municipios
      CreateMap<RegisterMunicipioDto, Municipio>();
      CreateMap<UpdateMunicipioDto, Municipio>()
        .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));
      CreateMap<Municipio, GetMunicipioDto>().ReverseMap();
      #endregion
      #region Localidad
      CreateMap<RegisterLocalidadDto, Localidad>();
      CreateMap<UpdateLocalidadDto, Localidad>()
        .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));
      CreateMap<Localidad, GetLocalidadDto>().ReverseMap();
      #endregion
      #region DerechoHab
      CreateMap<RegisterDerechoHabDto, DerechoHabitacion>();
      CreateMap<UpdateDerechoHabDto, DerechoHabitacion>()
        .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));
      CreateMap<DerechoHabitacion, GetDerechoHabDto>().ReverseMap();
      #endregion
      #region MotivosEgreso
      CreateMap<RegisterMotivosEDto, MotivoEgreso>();
      CreateMap<UpdateMotivosEDto, MotivoEgreso>()
        .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));
      CreateMap<MotivoEgreso, GetMotivosEDto>().ReverseMap();
      #endregion
      #region LogoPdf
      CreateMap<LogoPdf, GetLogoPdfDto>()
        .ForMember(dest => dest.ImagenUrl,
                   opt => opt.MapFrom(src => $"/api/LogoPdf/{src.IdLogo}/imagen"));
      CreateMap<CreateLogoPdfDto, LogoPdf>()
        .ForMember(dest => dest.ImagenData,
                   opt => opt.MapFrom(src => Convert.FromBase64String(
                       src.ImagenBase64.Contains(",")
                         ? src.ImagenBase64.Substring(src.ImagenBase64.IndexOf(",") + 1)
                         : src.ImagenBase64)));
      CreateMap<UpdateLogoPdfDto, LogoPdf>()
        .ForMember(dest => dest.ImagenData,
                   opt => opt.MapFrom(src => Convert.FromBase64String(
                       src.ImagenBase64.Contains(",")
                         ? src.ImagenBase64.Substring(src.ImagenBase64.IndexOf(",") + 1)
                         : src.ImagenBase64)))
        .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));
      #endregion
      #region Panel
      CreateMap<CreatePanelDto, Panel>();
      CreateMap<UpdatePanelDto, Panel>()
        .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));
      CreateMap<Panel, GetPanelDto>().ReverseMap();
      #endregion
    }
  }
}
